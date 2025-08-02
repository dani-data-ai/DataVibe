'use client'

import { Check, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  name: string
  description: string
  icon: LucideIcon
  status: 'complete' | 'current' | 'upcoming'
}

interface StepperProgressProps {
  steps: Step[]
  currentStep: number
}

export default function StepperProgress({ steps, currentStep }: StepperProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-16 max-w-4xl mx-auto">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-sm">
        <ol role="list" className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const Icon = step.icon
            const isLast = stepIdx === steps.length - 1
            
            return (
              <li key={step.name} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: stepIdx * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Step Circle */}
                  <div className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300",
                    step.status === 'complete' && "bg-green-500 text-white shadow-lg shadow-green-200",
                    step.status === 'current' && "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                    step.status === 'upcoming' && "bg-gray-100 text-gray-400 border border-gray-200"
                  )}>
                    {step.status === 'complete' ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                    
                    {/* Pulse animation for current step */}
                    {step.status === 'current' && (
                      <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    )}
                  </div>
                  
                  {/* Step Text */}
                  <div className="mt-3 text-center">
                    <p className={cn(
                      "text-sm font-medium transition-colors",
                      step.status === 'complete' && "text-green-600",
                      step.status === 'current' && "text-primary",
                      step.status === 'upcoming' && "text-gray-500"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground hidden md:block max-w-[120px] mt-1">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                
                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 h-px mx-4 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-green-500 rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: step.status === 'complete' ? 1 : step.status === 'current' ? 0.5 : 0 
                      }}
                      transition={{ duration: 0.5, delay: stepIdx * 0.1 + 0.2 }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}