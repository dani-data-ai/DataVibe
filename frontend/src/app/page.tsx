'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import ConnectionForm from '@/components/database/ConnectionForm'
import QueryInput from '@/components/query/QueryInput'
import QueryPreview from '@/components/query/QueryPreview'
import QueryResults from '@/components/results/QueryResults'
import { api } from '@/lib/api'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [queryPreview, setQueryPreview] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleConnectionSuccess = (session_id: string) => {
    setSessionId(session_id)
    setCurrentStep(2)
  }

  const handleQueryPreview = (preview: any) => {
    setQueryPreview(preview)
    setCurrentStep(3)
  }

  const handleQueryExecution = (result: any) => {
    setQueryResult(result)
    setCurrentStep(4)
  }

  const resetToQuery = () => {
    setQueryPreview(null)
    setQueryResult(null)
    setCurrentStep(2)
  }

  const resetToConnection = () => {
    setSessionId('')
    setQueryPreview(null)
    setQueryResult(null)
    setCurrentStep(1)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                DataVibe ⚡
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                AI-powered natural language database interaction
              </p>
              <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
                ☁️ Cloud-only • 🔒 Read-only • 🆓 Free-tier providers only
              </div>
            </div>
            
            {user ? (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">
                  Welcome, {user.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Sign In
              </button>
            )}
          </div>
          
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                🔐 Authentication required. Please sign in to access DataVibe.
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps - Only show if user is authenticated */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[
                { step: 1, label: 'Connect', active: currentStep >= 1 },
                { step: 2, label: 'Query', active: currentStep >= 2 },
                { step: 3, label: 'Preview', active: currentStep >= 3 },
                { step: 4, label: 'Results', active: currentStep >= 4 },
              ].map(({ step, label, active }) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 text-sm ${active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                  {step < 4 && <div className="w-8 h-px bg-gray-300 mx-4" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {user && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Step 1: Database Connection */}
            <div className={currentStep === 1 ? 'block' : 'hidden'}>
              <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
            </div>

          {/* Step 2: Query Input */}
          {currentStep >= 2 && (
            <div className={currentStep === 2 ? 'block' : 'hidden'}>
              <QueryInput 
                sessionId={sessionId} 
                onQueryPreview={handleQueryPreview}
              />
            </div>
          )}

          {/* Step 3: Query Preview */}
          {currentStep >= 3 && queryPreview && (
            <div className={currentStep === 3 ? 'block' : 'hidden'}>
              <QueryPreview 
                preview={queryPreview}
                sessionId={sessionId}
                onExecute={handleQueryExecution}
              />
            </div>
          )}

          {/* Step 4: Query Results */}
          {currentStep >= 4 && queryResult && (
            <div>
              <QueryResults 
                result={queryResult}
                sqlQuery={queryPreview?.sql_generated}
              />
              <div className="mt-6 text-center">
                <button
                  onClick={resetToQuery}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                >
                  🔄 Ask Another Question
                </button>
              </div>
            </div>
          )}

          {/* Show Connection Status */}
          {sessionId && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <span>✅ Connected to database</span>
                <button
                  onClick={resetToConnection}
                  className="text-green-700 hover:text-green-900 underline"
                >
                  Change
                </button>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </main>
  )
}