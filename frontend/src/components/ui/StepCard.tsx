'use client'

import { ReactNode } from 'react'

interface StepCardProps {
  title: string
  description: string
  icon?: ReactNode
  children: ReactNode
  isActive?: boolean
  isCompleted?: boolean
  className?: string
}

export default function StepCard({ 
  title, 
  description, 
  icon, 
  children, 
  isActive = false, 
  isCompleted = false,
  className = ''
}: StepCardProps) {
  return (
    <div className={`
      bg-white rounded-xl shadow-lg border-2 transition-all duration-300
      ${isActive ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'}
      ${isCompleted ? 'border-green-500 shadow-green-100' : ''}
      ${className}
    `}>
      <div className="p-6 sm:p-8">
        <div className="flex items-start space-x-4 mb-6">
          {icon && (
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg
              ${isCompleted ? 'bg-green-100 text-green-600' : isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
            `}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className={`
              text-xl font-bold mb-2
              ${isCompleted ? 'text-green-900' : isActive ? 'text-blue-900' : 'text-gray-700'}
            `}>
              {title}
            </h3>
            <p className="text-gray-600">{description}</p>
          </div>
          {isCompleted && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}