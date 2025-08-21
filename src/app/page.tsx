'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-center space-y-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <h1 className="text-4xl sm:text-6xl font-bold text-blue-700">
          Welcome to CasePLUS
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Your all-in-one legal case management platform to create, organize, and track cases effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/configure/upload"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg hover:bg-blue-50 transition"
          >
            Create Case
          </Link>
        </div>
       
      </motion.div>

      {/* Features */}
      <section className="max-w-5xl mx-auto text-left">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Why CasePLUS?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            title="🧾 Organized Case Tracking"
            desc="Keep all your documents, dates, and deadlines neatly organized in one dashboard."
          />
          <Feature
            title="🔒 Secure & Private"
            desc="All your data is encrypted and safely stored — built with security-first mindset."
          />
          <Feature
            title="📱 Accessible Anywhere"
            desc="Manage cases from mobile, tablet, or desktop. Your cases, always within reach."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">What People Say</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Testimonial
            name="Adv. Priya Sharma"
            text="CasePLUS saves me hours every week. Everything is so organized and accessible."
          />
          <Testimonial
            name="Ravi Jain"
            text="Great experience managing legal documents for my firm. Secure, fast, and reliable."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-10 text-center mt-20">
        <p className="text-gray-500">© {new Date().getFullYear()} CasePLUS. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </footer>
    </main>
  )
}

const Feature = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
    <h3 className="text-xl font-semibold text-blue-700 mb-2">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </div>
)

const Testimonial = ({ name, text }: { name: string; text: string }) => (
  <div className="bg-white p-6 border rounded-lg shadow">
    <p className="text-gray-700 italic">“{text}”</p>
    <p className="mt-4 text-sm text-gray-500">– {name}</p>
  </div>
)