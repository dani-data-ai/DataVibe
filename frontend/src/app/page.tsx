'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AuthModal from '@/components/auth/AuthModal'
import ConnectionForm from '@/components/database/ConnectionForm'
import QueryInput from '@/components/query/QueryInput'
import QueryPreview from '@/components/query/QueryPreview'
import QueryResults from '@/components/results/QueryResults'
import StepperProgress from '@/components/ui/StepperProgress'
import SessionManager from '@/components/session/SessionManager'
import HelpSystem from '@/components/help/HelpSystem'
import { Database, MessageSquare, FileCheck, BarChart3, User, Zap, Cloud, Shield, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [queryPreview, setQueryPreview] = useState<any>(null)
  const [queryResult, setQueryResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { 
      id: 1, 
      name: 'Connect', 
      description: 'Connect to your cloud database',
      icon: Database,
      status: (currentStep > 1 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming') as 'complete' | 'current' | 'upcoming'
    },
    { 
      id: 2, 
      name: 'Query', 
      description: 'Ask questions in natural language',
      icon: MessageSquare,
      status: (currentStep > 2 ? 'complete' : currentStep === 2 ? 'current' : 'upcoming') as 'complete' | 'current' | 'upcoming'
    },
    { 
      id: 3, 
      name: 'Preview', 
      description: 'Review and approve generated SQL',
      icon: FileCheck,
      status: (currentStep > 3 ? 'complete' : currentStep === 3 ? 'current' : 'upcoming') as 'complete' | 'current' | 'upcoming'
    },
    { 
      id: 4, 
      name: 'Results', 
      description: 'View your query results',
      icon: BarChart3,
      status: (currentStep >= 4 ? 'complete' : 'upcoming') as 'complete' | 'current' | 'upcoming'
    }
  ]

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

  const handleSessionChange = (newSessionId: string | null) => {
    if (newSessionId) {
      setSessionId(newSessionId)
      setCurrentStep(2)
    } else {
      resetToConnection()
    }
  }

  const getCurrentStepName = () => {
    switch (currentStep) {
      case 1: return 'connect'
      case 2: return 'query'
      case 3: return 'preview'
      case 4: return 'results'
      default: return 'connect'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-muted-foreground font-medium">Loading DataVibe...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="relative">
                  <Zap className="w-12 h-12 text-primary animate-float" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  DataVibe
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto lg:mx-0">
                Transform your data questions into insights with AI-powered natural language database queries
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <Badge variant="info" className="gap-1">
                  <Cloud className="w-3 h-3" />
                  Cloud-only
                </Badge>
                <Badge variant="success" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Read-only
                </Badge>
                <Badge variant="default" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Free-tier providers
                </Badge>
              </div>
            </div>
            
            {user ? (
              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Authenticated
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                size="lg"
                variant="gradient"
                onClick={() => setShowAuthModal(true)}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Sign In to Start
              </Button>
            )}
          </div>
          
          {!user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-amber-600" />
                    <p className="text-amber-800 font-medium">
                      Authentication required to access your secure database connections
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Progress Steps - Only show if user is authenticated */}
        {user && (
          <StepperProgress steps={steps} currentStep={currentStep} />
        )}

        {user && (
          <motion.div 
            className="max-w-6xl mx-auto space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Step 1: Database Connection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: currentStep === 1 ? 1 : 0.7, x: 0 }}
              transition={{ duration: 0.5 }}
              className={currentStep === 1 ? 'block' : currentStep > 1 ? 'block' : 'hidden'}
            >
              <Card className={`glass-effect transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      currentStep > 1 ? 'bg-green-100 text-green-600' : 
                      currentStep === 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Connect to Database
                        {currentStep > 1 && <Badge variant="success">Complete</Badge>}
                      </CardTitle>
                      <CardDescription>
                        Connect to your cloud database using a secure connection string
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Query Input */}
            {currentStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: currentStep === 2 ? 1 : 0.7, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className={`glass-effect transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        currentStep > 2 ? 'bg-green-100 text-green-600' : 
                        currentStep === 2 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Natural Language Query
                          {currentStep > 2 && <Badge variant="success">Complete</Badge>}
                        </CardTitle>
                        <CardDescription>
                          Ask questions about your data using plain English
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <QueryInput 
                      sessionId={sessionId} 
                      onQueryPreview={handleQueryPreview}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Query Preview */}
            {currentStep >= 3 && queryPreview && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: currentStep === 3 ? 1 : 0.7, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className={`glass-effect transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        currentStep > 3 ? 'bg-green-100 text-green-600' : 
                        currentStep === 3 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Review Generated SQL
                          {currentStep > 3 && <Badge variant="success">Complete</Badge>}
                        </CardTitle>
                        <CardDescription>
                          Preview and approve the generated SQL query before execution
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <QueryPreview 
                      preview={queryPreview}
                      sessionId={sessionId}
                      onExecute={handleQueryExecution}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Query Results */}
            {currentStep >= 4 && queryResult && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="glass-effect ring-2 ring-green-200/50 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-green-100 text-green-600">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Query Results
                          <Badge variant="success">Complete</Badge>
                        </CardTitle>
                        <CardDescription>
                          Your query has been executed successfully
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <QueryResults 
                      result={queryResult}
                      sqlQuery={queryPreview?.sql_generated}
                    />
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={resetToQuery}
                        size="lg"
                        className="gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ask Another Question
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={resetToConnection}
                        size="lg"
                        className="gap-2"
                      >
                        <Database className="w-4 h-4" />
                        Change Database
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Session Management */}
            {sessionId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SessionManager 
                  currentSessionId={sessionId}
                  onSessionChange={handleSessionChange}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Help System */}
      <HelpSystem currentStep={getCurrentStepName()} />
    </main>
  )
}