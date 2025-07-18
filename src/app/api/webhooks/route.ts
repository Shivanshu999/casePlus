import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import OrderReceivedEmail from '@/components/email/OrderReceived'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  console.log('=== WEBHOOK RECEIVED ===')
  
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    console.log('Webhook signature present:', !!signature)

    if (!signature) {
      console.log('ERROR: No signature found')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Event type:', event.type)
    console.log('Event ID:', event.id)

    if (event.type === 'checkout.session.completed') {
      console.log('=== PROCESSING CHECKOUT SESSION ===')
      
      if (!event.data.object.customer_details?.email) {
        console.log('ERROR: Missing user email')
        throw new Error('Missing user email')
      }

      const session = event.data.object as Stripe.Checkout.Session
      console.log('Session ID:', session.id)
      console.log('Session metadata:', session.metadata)

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      }

      console.log('Extracted userId:', userId)
      console.log('Extracted orderId:', orderId)

      if (!userId || !orderId) {
        console.log('ERROR: Invalid request metadata')
        throw new Error('Invalid request metadata')
      }

      // Check if order exists
      console.log('=== CHECKING ORDER ===')
      const existingOrder = await db.order.findFirst({
        where: { id: orderId, userId: userId }
      })

      console.log('Order found:', !!existingOrder)
      console.log('Order isPaid status:', existingOrder?.isPaid)

      if (!existingOrder) {
        console.log('ERROR: Order not found')
        throw new Error('Order not found or access denied')
      }

      if (existingOrder.isPaid) {
        console.log('Order already processed, skipping')
        return NextResponse.json({ result: event, ok: true })
      }

      const billingAddress = session.customer_details?.address
      const shippingAddress = session.customer_details?.address

      console.log('Billing address present:', !!billingAddress)
      console.log('Shipping address present:', !!shippingAddress)

      if (!billingAddress || !shippingAddress) {
        console.log('ERROR: Missing address information')
        throw new Error('Missing required address information')
      }

      if (!session.customer_details?.name) {
        console.log('ERROR: Missing customer name')
        throw new Error('Missing customer name')
      }

      console.log('=== UPDATING ORDER ===')
      
      const shippingAddressData = {
        name: session.customer_details.name,
        city: shippingAddress.city!,
        country: shippingAddress.country!,
        postalCode: shippingAddress.postal_code!,
        street: shippingAddress.line1!,
        state: shippingAddress.state,
      }

      const billingAddressData = {
        name: session.customer_details.name,
        city: billingAddress.city!,
        country: billingAddress.country!,
        postalCode: billingAddress.postal_code!,
        street: billingAddress.line1!,
        state: billingAddress.state,
      }

      console.log('Shipping address data:', shippingAddressData)
      console.log('Billing address data:', billingAddressData)

      try {
        const updatedOrder = await db.$transaction(async (tx) => {
          console.log('Creating shipping address...')
          const createdShippingAddress = await tx.shippingAddress.create({
            data: shippingAddressData,
          })
          console.log('Shipping address created:', createdShippingAddress.id)

          console.log('Creating billing address...')
          const createdBillingAddress = await tx.billingAddress.create({
            data: billingAddressData,
          })
          console.log('Billing address created:', createdBillingAddress.id)

          console.log('Updating order...')
          const updated = await tx.order.update({
            where: { id: orderId },
            data: {
              isPaid: true,
              shippingAddressId: createdShippingAddress.id,
              billingAddressId: createdBillingAddress.id,
            },
            include: {
              shippingAddress: true,
              billingAddress: true,
              configuration: true,
              user: true,
            },
          })
          console.log('Order updated successfully, isPaid:', updated.isPaid)
          return updated
        })

        console.log('=== DATABASE TRANSACTION COMPLETED ===')

        // Send confirmation email
        try {
          console.log('Sending confirmation email...')
          await resend.emails.send({
            from: 'CaseCobra <hello@joshtriedcoding.com>',
            to: [event.data.object.customer_details.email],
            subject: 'Thanks for your order!',
            react: OrderReceivedEmail({
              orderId,
              orderDate: updatedOrder.createdAt.toLocaleDateString(),
              shippingAddress: shippingAddressData,
            }),
          })
          console.log('Email sent successfully')
        } catch (emailError) {
          console.error('Email sending failed:', emailError)
        }

      } catch (dbError) {
        console.error('Database transaction failed:', dbError)
        throw dbError
      }
    } else if (event.type === 'charge.updated') {
      console.log('=== PROCESSING CHARGE UPDATED ===')
      
      const charge = event.data.object as Stripe.Charge
      console.log('Charge ID:', charge.id)
      console.log('Charge status:', charge.status)
      console.log('Charge paid:', charge.paid)

      // For charge.updated, we need to get the payment intent to find the order
      if (charge.paid && charge.payment_intent) {
        console.log('Payment Intent ID:', charge.payment_intent)
        
        // Get the payment intent to access metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
        console.log('Payment Intent metadata:', paymentIntent.metadata)
        
        const { userId, orderId } = paymentIntent.metadata || {
          userId: null,
          orderId: null,
        }

        console.log('Extracted userId:', userId)
        console.log('Extracted orderId:', orderId)

        if (!userId || !orderId) {
          console.log('No metadata found, ignoring charge.updated')
          return NextResponse.json({ result: event, ok: true })
        }

        // Check if order exists and update it
        const existingOrder = await db.order.findFirst({
          where: { id: orderId, userId: userId }
        })

        if (!existingOrder) {
          console.log('Order not found for charge.updated')
          return NextResponse.json({ result: event, ok: true })
        }

        if (existingOrder.isPaid) {
          console.log('Order already paid, skipping charge.updated')
          return NextResponse.json({ result: event, ok: true })
        }

        // Update order to paid
        console.log('Updating order from charge.updated...')
        await db.order.update({
          where: { id: orderId },
          data: { isPaid: true }
        })
        
        console.log('Order updated successfully from charge.updated')
      }
    } else {
      console.log('Ignoring event type:', event.type)
    }

    console.log('=== WEBHOOK COMPLETED SUCCESSFULLY ===')
    return NextResponse.json({ result: event, ok: true })
    
  } catch (err) {
    console.error('=== WEBHOOK ERROR ===')
    console.error('Error details:', err)
    
    if (err instanceof Error) {
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
    }

    return NextResponse.json(
      { message: 'Something went wrong', ok: false },
      { status: 500 }
    )
  }
}