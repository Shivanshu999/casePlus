'use client'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getPaymentStatus } from './action'
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatPrice } from '@/lib/utils'
import PhonePreview from '@/components/PhonePreview'

const Thankyou = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || ''
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Set timeout for payment verification
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true)
    }, 2 * 60 * 1000) // 2 minutes timeout

    return () => clearTimeout(timer)
  }, [])

  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['get-payment-status', orderId],
    queryFn: async () => {
      console.log('Fetching payment status for order:', orderId)
      const result = await getPaymentStatus({orderId})
      console.log('Payment status result:', result)
      return result
    },
    retry: (failureCount) => {
      // Stop retrying after timeout or max attempts
      if (timeoutReached || failureCount >= 5) {
        return false
      }
      return true
    },
    retryDelay: 2000, // Check every 2 seconds instead of 500ms
    enabled: !!orderId && !timeoutReached,
    refetchInterval: (data) => {
      // Only refetch if we're still getting false and haven't timed out
      return data === false && !timeoutReached ? 3000 : false
    }
  })

  if (!orderId) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <AlertCircle className='h-12 w-12 text-red-500' />
          <h3 className='font-semibold text-xl text-red-600'>Invalid Order</h3>
          <p>No order ID was provided in the URL.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
          <h3 className='font-semibold text-xl'>Loading your order...</h3>
          <p>This won not take long.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <AlertCircle className='h-12 w-12 text-red-500' />
          <h3 className='font-semibold text-xl text-red-600'>Something went wrong</h3>
          <p className='text-center max-w-md'>
            {error.message || 'Error loading order information.'}
          </p>
          <button 
            onClick={() => refetch()}
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show timeout message if payment verification is taking too long
  if (data === false && timeoutReached) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-4 max-w-md text-center'>
          <Clock className='h-12 w-12 text-yellow-500' />
          <h3 className='font-semibold text-xl text-yellow-600'>Payment Verification Delayed</h3>
          <p className='text-zinc-600'>
            Your payment is still being processed. This can take a few minutes.
          </p>
          <p className='text-sm text-zinc-500'>
            Order ID: <span className='font-mono'>{orderId}</span>
          </p>
          <div className='flex gap-2 mt-4'>
            <button 
              onClick={() => {
                setTimeoutReached(false)
                refetch()
              }}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              Check Again
            </button>
          </div>
          <div className='mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
            <p className='text-sm text-yellow-800'>
              <strong>Do not worry!</strong> Your order has been received. 
              You will receive a confirmation email once payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (data === false) {
    return (
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
          <h3 className='font-semibold text-xl'>Verifying your payment...</h3>
          <p>This might take a moment.</p>
          <p className='text-sm text-zinc-400'>Order ID: {orderId}</p>
          
          <button 
            onClick={() => refetch()}
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm'
          >
            Check Now
          </button>
        </div>
      </div>
    )
  }

  const {configuration, billingAddress, shippingAddress, amount} = data
  const {color} = configuration

  return (
    <div className='bg-white'>
      <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
        <div className='max-w-xl'>
          <div className='flex items-center gap-2'>
            <CheckCircle className='h-6 w-6 text-green-500' />
            <p className='text-base font-medium text-primary'>Thank you!</p>
          </div>
          <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
            Your case is on the way!
          </h1>
          <p className='mt-2 text-base text-zinc-500'>
            We have received your order and are now processing it.
          </p>

          <div className='mt-12 text-sm font-medium'>
            <p className='text-zinc-900'>Order number</p>
            <p className='mt-2 text-zinc-500 font-mono'>{orderId}</p>
          </div>
        </div>

        <div className='mt-10 border-t border-zinc-200'>
          <div className='mt-10 flex flex-auto flex-col'>
            <h4 className='font-semibold text-zinc-900'>
              You made a great choice!
            </h4>
            <p className='mt-2 text-sm text-zinc-600'>
              We at CaseCobra believe that a phone case does not only need to
              look good, but also last you for the years to come. We offer a
              5-year print guarantee: If your case is not of the highest quality,
              we wll replace it for free.
            </p>
          </div>
        </div>

        <div className='flex space-x-6 overflow-hidden mt-4 rounded-xl bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl'>
          <PhonePreview
            croppedImageUrl={configuration.croppedImageUrl!}
            color={color!}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 py-10 text-sm'>
          <div>
            <p className='font-medium text-gray-900'>Shipping address</p>
            <div className='mt-2 text-zinc-700'>
              <address className='not-italic'>
                <span className='block'>{shippingAddress?.name}</span>
                <span className='block'>{shippingAddress?.street}</span>
                <span className='block'>
                  {shippingAddress?.postalCode} {shippingAddress?.city}
                </span>
              </address>
            </div>
          </div>
          <div>
            <p className='font-medium text-gray-900'>Billing address</p>
            <div className='mt-2 text-zinc-700'>
              <address className='not-italic'>
                <span className='block'>{billingAddress?.name}</span>
                <span className='block'>{billingAddress?.street}</span>
                <span className='block'>
                  {billingAddress?.postalCode} {billingAddress?.city}
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 border-t border-zinc-200 py-10 text-sm'>
          <div>
            <p className='font-medium text-zinc-900'>Payment status</p>
            <div className='mt-2 flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-green-500' />
              <span className='text-zinc-700'>Paid</span>
            </div>
          </div>

          <div>
            <p className='font-medium text-zinc-900'>Shipping Method</p>
            <p className='mt-2 text-zinc-700'>
              DHL, takes up to 3 working days
            </p>
          </div>
        </div>

        <div className='space-y-6 border-t border-zinc-200 pt-10 text-sm'>
          <div className='flex justify-between'>
            <p className='font-medium text-zinc-900'>Subtotal</p>
            <p className='text-zinc-700'>{formatPrice(amount)}</p>
          </div>
          <div className='flex justify-between'>
            <p className='font-medium text-zinc-900'>Shipping</p>
            <p className='text-zinc-700'>{formatPrice(0)}</p>
          </div>
          <div className='flex justify-between border-t border-zinc-200 pt-4'>
            <p className='font-semibold text-zinc-900'>Total</p>
            <p className='font-semibold text-zinc-700'>{formatPrice(amount)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Thankyou