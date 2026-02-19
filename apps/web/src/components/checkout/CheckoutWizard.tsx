'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CheckoutContact, CheckoutDelivery } from '@/lib/validators'
import { StepContact } from './StepContact'
import { StepDelivery } from './StepDelivery'
import { StepSummary } from './StepSummary'
import { StepConfirmation } from './StepConfirmation'

const steps = ['Dane', 'Dostawa', 'Podsumowanie', 'Potwierdzenie']

export function CheckoutWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [contact, setContact] = useState<CheckoutContact>({
    name: '', email: '', phone: '', company: '', nip: '',
  })
  const [delivery, setDelivery] = useState<CheckoutDelivery>({
    street: '', city: 'Szczecin', postalCode: '', deliveryDate: '', deliveryTimeSlot: '10:00-12:00', notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer')
  const [orderNumber, setOrderNumber] = useState('')

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((label, idx) => {
            const stepNum = idx + 1
            const isCompleted = currentStep > stepNum
            const isActive = currentStep === stepNum
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isCompleted
                        ? 'bg-forest-300 text-forest-950'
                        : isActive
                          ? 'bg-accent text-forest-950'
                          : 'bg-forest-600 text-forest-300'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : stepNum}
                    {isActive && (
                      <motion.span
                        className="absolute h-10 w-10 rounded-full border-2 border-accent"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </div>
                  <span className={`mt-2 text-xs ${isActive ? 'text-accent font-semibold' : 'text-forest-400'}`}>
                    {label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${isCompleted ? 'bg-forest-300' : 'bg-forest-600'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Steps */}
      {currentStep === 1 && (
        <StepContact
          data={contact}
          onNext={(data) => { setContact(data); setCurrentStep(2) }}
        />
      )}
      {currentStep === 2 && (
        <StepDelivery
          data={delivery}
          onNext={(data) => { setDelivery(data); setCurrentStep(3) }}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <StepSummary
          contact={contact}
          delivery={delivery}
          paymentMethod={paymentMethod}
          onPaymentChange={setPaymentMethod}
          onBack={() => setCurrentStep(2)}
          onSuccess={(num) => { setOrderNumber(num); setCurrentStep(4) }}
        />
      )}
      {currentStep === 4 && (
        <StepConfirmation
          orderNumber={orderNumber}
          paymentMethod={paymentMethod}
        />
      )}
    </div>
  )
}
