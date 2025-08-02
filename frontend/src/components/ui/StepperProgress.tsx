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
    <nav aria-label="Progress" className="w-full">
      <div className="glass-effect-strong rounded-3xl p-8 lg:p-12 border border-white/20 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">Your Progress</h2>
          <p className="text-muted-foreground">Follow these steps to query your database with AI</p>
        </div>
        
        <ol role="list" className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-8 lg:gap-4">
          {steps.map((step, stepIdx) => {
            const Icon = step.icon
            const isLast = stepIdx === steps.length - 1
            
            return (
              <li key={step.name} className="flex flex-col lg:flex-row items-start lg:items-center flex-1 w-full lg:w-auto">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: stepIdx * 0.15, duration: 0.5, ease: "easeOut" }}
                  className="flex items-center gap-4 lg:flex-col lg:text-center w-full lg:w-auto"
                >
                  {/* Step Circle */}
                  <div className={cn(
                    "relative flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl transition-all duration-500 flex-shrink-0",
                    step.status === 'complete' && "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200/50",
                    step.status === 'current' && "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/40 ring-4 ring-primary/20",
                    step.status === 'upcoming' && "bg-white border-2 border-gray-200 text-gray-400 shadow-sm"
                  )}>
                    {step.status === 'complete' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: stepIdx * 0.15 + 0.3, type: "spring", stiffness: 400 }}
                      >
                        <Check className="h-7 w-7 lg:h-8 lg:w-8" />
                      </motion.div>
                    ) : (
                      <Icon className="h-7 w-7 lg:h-8 lg:w-8" />
                    )}
                    
                    {/* Pulse animation for current step */}
                    {step.status === 'current' && (
                      <div className="absolute inset-0 rounded-2xl bg-primary animate-ping opacity-20" />
                    )}
                    
                    {/* Step number badge */}
                    <div className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                      step.status === 'complete' && "bg-green-600 text-white",
                      step.status === 'current' && "bg-primary text-white",
                      step.status === 'upcoming' && "bg-gray-200 text-gray-500"
                    )}>
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Step Text */}
                  <div className="flex-1 lg:flex-none lg:mt-4 lg:max-w-[140px]">
                    <p className={cn(
                      "text-base lg:text-lg font-semibold transition-colors",
                      step.status === 'complete' && "text-green-600",
                      step.status === 'current' && "text-primary",
                      step.status === 'upcoming' && "text-gray-500"
                    )}>
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 lg:mt-2">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                
                {/* Connector Line - Only show on desktop */}
                {!isLast && (
                  <div className="hidden lg:flex flex-1 h-px mx-6 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-green-500 rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ 
                        scaleX: step.status === 'complete' ? 1 : step.status === 'current' ? 0.5 : 0 
                      }}
                      transition={{ duration: 0.8, delay: stepIdx * 0.15 + 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
                
                {/* Connector Line - Mobile vertical */}
                {!isLast && (
                  <div className="lg:hidden w-px h-8 ml-7 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-primary to-green-500 rounded-full origin-top"
                      initial={{ scaleY: 0 }}
                      animate={{ 
                        scaleY: step.status === 'complete' ? 1 : step.status === 'current' ? 0.5 : 0 
                      }}
                      transition={{ duration: 0.8, delay: stepIdx * 0.15 + 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        
        {/* Progress percentage */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}