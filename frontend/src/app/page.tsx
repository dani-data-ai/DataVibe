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
import ThemeToggle from '@/components/ui/ThemeToggle'
import { 
  Database, 
  MessageSquare, 
  FileCheck, 
  BarChart3, 
  User, 
  Zap, 
  Cloud, 
  Shield, 
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-emerald-500/40 rounded-full animate-spin mx-auto" 
                 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="mt-8 text-2xl font-semibold text-foreground">Loading DataVibe</h3>
            <p className="mt-2 text-muted-foreground">Preparing your AI database assistant...</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-white/10 dark:border-white/20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <Zap className="w-8 h-8 text-primary animate-float" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold gradient-text">DataVibe</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {user ? (
                  <div className="flex items-center gap-4">
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/'}
                        className="hover:bg-white/50 dark:hover:bg-white/10"
                      >
                        Query
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/schema'}
                        className="hover:bg-white/50 dark:hover:bg-white/10"
                      >
                        Schema
                      </Button>
                      {user?.user_metadata?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = '/admin'}
                          className="hover:bg-white/50 dark:hover:bg-white/10"
                        >
                          Admin
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-emerald-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground hidden sm:inline">
                        {user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => signOut()}
                      className="hover:bg-white/50 dark:hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-primary hover:shadow-colored transition-all duration-300"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
                Transform Data Questions into{' '}
                <span className="gradient-text">Insights</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
                AI-powered natural language database queries that understand your business context and deliver instant results
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-3 justify-center mb-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Badge variant="info" className="text-sm px-4 py-2 gap-2">
                <Cloud className="w-4 h-4" />
                Cloud-Native
              </Badge>
              <Badge variant="success" className="text-sm px-4 py-2 gap-2">
                <Shield className="w-4 h-4" />
                Read-Only Security
              </Badge>
              <Badge variant="default" className="text-sm px-4 py-2 gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered
              </Badge>
            </motion.div>

            {!user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-16"
              >
                <Card className="glass-effect-strong max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold text-amber-800 mb-2">
                          Secure Authentication Required
                        </h3>
                        <p className="text-amber-700 mb-4">
                          Sign in to securely connect to your databases and start exploring your data with AI
                        </p>
                        <Button
                          onClick={() => setShowAuthModal(true)}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
                        >
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Progress Steps - Only show if user is authenticated */}
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12"
            >
              <StepperProgress steps={steps} currentStep={currentStep} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {user && (
            <motion.div 
              className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="max-w-5xl mx-auto space-y-8">
                {/* Step 1: Database Connection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: currentStep === 1 ? 1 : 0.7, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className={currentStep === 1 ? 'block' : currentStep > 1 ? 'block' : 'hidden'}
                >
                  <Card className={`glass-effect hover-lift transition-all duration-500 ${
                    currentStep === 1 ? 'ring-2 ring-primary/20 shadow-colored' : ''
                  }`}>
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl transition-all duration-300 ${
                          currentStep > 1 ? 'bg-green-100 text-green-600' : 
                          currentStep === 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {currentStep > 1 ? <CheckCircle className="w-7 h-7" /> : <Database className="w-7 h-7" />}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-3 text-2xl">
                            Connect to Database
                            {currentStep > 1 && (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Connected
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-base mt-1">
                            Securely connect to your cloud database using a connection string
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-8 pb-8">
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
                    <Card className={`glass-effect hover-lift transition-all duration-500 ${
                      currentStep === 2 ? 'ring-2 ring-primary/20 shadow-colored' : ''
                    }`}>
                      <CardHeader className="pb-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl transition-all duration-300 ${
                            currentStep > 2 ? 'bg-green-100 text-green-600' : 
                            currentStep === 2 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {currentStep > 2 ? <CheckCircle className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                              Natural Language Query
                              {currentStep > 2 && (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Generated
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                              Ask questions about your data using plain English
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-8 pb-8">
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
                    <Card className={`glass-effect hover-lift transition-all duration-500 ${
                      currentStep === 3 ? 'ring-2 ring-primary/20 shadow-colored' : ''
                    }`}>
                      <CardHeader className="pb-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl transition-all duration-300 ${
                            currentStep > 3 ? 'bg-green-100 text-green-600' : 
                            currentStep === 3 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {currentStep > 3 ? <CheckCircle className="w-7 h-7" /> : <FileCheck className="w-7 h-7" />}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                              Review Generated SQL
                              {currentStep > 3 && (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Executed
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                              Preview and approve the generated SQL query before execution
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-8 pb-8">
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
                    <Card className="glass-effect-strong ring-2 ring-green-200/50 shadow-xl hover-lift">
                      <CardHeader className="pb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <BarChart3 className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-3 text-2xl">
                              Query Results
                              <Badge variant="success" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Complete
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                              Your query has been executed successfully
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-8 pb-8">
                        <QueryResults 
                          result={queryResult}
                          sqlQuery={queryPreview?.sql_generated}
                        />
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            onClick={resetToQuery}
                            size="lg"
                            className="bg-gradient-primary hover:shadow-colored transition-all duration-300 gap-2"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Ask Another Question
                          </Button>
                          <Button
                            variant="outline"
                            onClick={resetToConnection}
                            size="lg"
                            className="gap-2 hover:bg-white/50"
                          >
                            <Database className="w-5 h-5" />
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {/* Help System */}
      <HelpSystem currentStep={getCurrentStepName()} />
    </div>
  )
}