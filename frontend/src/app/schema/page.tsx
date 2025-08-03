'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SchemaProposal from '@/components/schema/SchemaProposal'
import SchemaList from '@/components/schema/SchemaList'
import SchemaDetail from '@/components/schema/SchemaDetail'
import { 
  Database, 
  Plus, 
  Settings, 
  Shield, 
  Users,
  ArrowLeft,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Session {
  session_id: string
  connection_info: {
    provider: string
    database: string
  }
  created_at: string
}

export default function SchemaPage() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isAdmin = user?.user_metadata?.role === 'admin'

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/list')
      setSessions(response.sessions || [])
      if (response.sessions && response.sessions.length > 0) {
        setSelectedSession(response.sessions[0].session_id)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    }
  }

  const handleProposalCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('list')
  }

  const handleProposalSelect = (proposal: any) => {
    setSelectedProposal(proposal)
    setCurrentView('detail')
  }

  const handleProposalUpdate = () => {
    setRefreshTrigger(prev => prev + 1)
    // Refresh the selected proposal
    if (selectedProposal) {
      api.get(`/schema/proposals/${selectedProposal.id}`)
        .then(response => setSelectedProposal(response.proposal))
        .catch(console.error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access schema management features.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-white/10 dark:border-white/20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Database className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Schema Manager</span>
                <div className="text-xs text-muted-foreground">DataVibe</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Badge variant="default" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </Badge>
              )}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Schema <span className="gradient-text">Management</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Propose, review, and manage database schema changes with AI assistance and approval workflows
          </p>
        </motion.div>

        {/* Connection Status */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="glass-effect-strong max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Database Connected</h3>
                    <p className="text-sm text-muted-foreground">
                      {sessions[0]?.connection_info?.provider} - {sessions[0]?.connection_info?.database}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="px-3 py-1 rounded border bg-white/50 text-sm"
                    >
                      {sessions.map((session) => (
                        <option key={session.session_id} value={session.session_id}>
                          {session.connection_info?.database || 'Database'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="glass-effect-strong max-w-2xl mx-auto border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800">No Database Connection</h3>
                    <p className="text-sm text-amber-700">
                      Please connect to a database first to create schema proposals.
                    </p>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    Connect Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* View Navigation */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-center">
              <div className="flex gap-2 p-1 bg-white/50 rounded-lg border">
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('list')}
                  className="gap-2"
                >
                  <Database className="w-4 h-4" />
                  View Proposals
                </Button>
                <Button
                  variant={currentView === 'create' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('create')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Proposal
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {sessions.length > 0 && (
            <>
              {currentView === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SchemaList 
                    onSelectProposal={handleProposalSelect}
                    refreshTrigger={refreshTrigger}
                  />
                </motion.div>
              )}

              {currentView === 'create' && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-4xl mx-auto">
                    <SchemaProposal 
                      sessionId={selectedSession}
                      onProposalCreated={handleProposalCreated}
                    />
                  </div>
                </motion.div>
              )}

              {currentView === 'detail' && selectedProposal && (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-5xl mx-auto">
                    <SchemaDetail 
                      proposal={selectedProposal}
                      onBack={() => setCurrentView('list')}
                      onUpdate={handleProposalUpdate}
                      sessionId={selectedSession}
                    />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}