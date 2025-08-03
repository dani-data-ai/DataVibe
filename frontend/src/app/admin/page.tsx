'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Users,
  Database,
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuditEntry {
  id: string
  user_id: string
  event_type: string
  details: any
  timestamp: string
  session_id?: string
}

interface SystemStats {
  total_users: number
  active_sessions: number
  total_queries: number
  schema_proposals: number
  pending_approvals: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<'overview' | 'audit' | 'schemas' | 'users'>('overview')
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const isAdmin = user?.user_metadata?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Fetch audit logs and stats in parallel
      const [auditResponse, schemaResponse] = await Promise.all([
        api.get('/audit/events'),
        api.get('/schema/proposals')
      ])
      
      setAuditLogs(auditResponse.events || [])
      
      // Calculate stats from the data
      const uniqueUsers = new Set(auditResponse.events?.map((e: AuditEntry) => e.user_id) || []).size
      const activeSessions = new Set(auditResponse.events?.filter((e: AuditEntry) => e.session_id).map((e: AuditEntry) => e.session_id) || []).size
      const totalQueries = auditResponse.events?.filter((e: AuditEntry) => e.event_type === 'query_executed').length || 0
      const schemaProposals = schemaResponse.proposals?.length || 0
      const pendingApprovals = schemaResponse.proposals?.filter((p: any) => p.status === 'pending').length || 0
      
      setStats({
        total_users: uniqueUsers,
        active_sessions: activeSessions,
        total_queries: totalQueries,
        schema_proposals: schemaProposals,
        pending_approvals: pendingApprovals
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const exportAuditLogs = () => {
    const csv = [
      ['Timestamp', 'User ID', 'Event Type', 'Session ID', 'Details'],
      ...auditLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.user_id,
        log.event_type,
        log.session_id || '',
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'login': return 'bg-green-100 text-green-800'
      case 'logout': return 'bg-gray-100 text-gray-800'
      case 'query_executed': return 'bg-blue-100 text-blue-800'
      case 'schema_proposed': return 'bg-purple-100 text-purple-800'
      case 'schema_approved': return 'bg-emerald-100 text-emerald-800'
      case 'connection_created': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === 'all' || log.event_type === filterType
    
    return matchesSearch && matchesFilter
  })

  const uniqueEventTypes = Array.from(new Set(auditLogs.map(log => log.event_type)))

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access admin features.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-effect max-w-md mx-auto border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              Admin privileges are required to access this page.
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-white/10 dark:border-white/20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-red-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Admin Panel</span>
                <div className="text-xs text-muted-foreground">DataVibe</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="gap-1">
                <Shield className="w-3 h-3" />
                Administrator
              </Badge>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
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
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor system activity, manage users, and oversee schema proposals
          </p>
        </motion.div>

        {/* View Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-center">
            <div className="flex gap-2 p-1 bg-white/50 rounded-lg border">
              <Button
                variant={currentView === 'overview' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('overview')}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Overview
              </Button>
              <Button
                variant={currentView === 'audit' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('audit')}
                className="gap-2"
              >
                <Activity className="w-4 h-4" />
                Audit Logs
              </Button>
              <Button
                variant={currentView === 'schemas' ? 'default' : 'ghost'}
                onClick={() => window.location.href = '/schema'}
                className="gap-2"
              >
                <Database className="w-4 h-4" />
                Schema Management
              </Button>
            </div>
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading admin data...</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-8">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <>
              {currentView === 'overview' && stats && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold">{stats.total_users}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-green-100 text-green-600">
                            <Activity className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Active Sessions</p>
                            <p className="text-2xl font-bold">{stats.active_sessions}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Database className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Queries</p>
                            <p className="text-2xl font-bold">{stats.total_queries}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-cyan-100 text-cyan-600">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Schema Proposals</p>
                            <p className="text-2xl font-bold">{stats.schema_proposals}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pending Approvals</p>
                            <p className="text-2xl font-bold">{stats.pending_approvals}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>Latest system events and user actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditLogs.slice(0, 10).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border">
                            <div className="flex items-center gap-3">
                              <Badge className={getEventTypeColor(log.event_type)} variant="outline">
                                {log.event_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm font-medium">{log.user_id}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentView === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Audit Controls */}
                  <Card className="glass-effect">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Audit Logs
                          </CardTitle>
                          <CardDescription>Complete system activity log</CardDescription>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            className="gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={exportAuditLogs}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Search and Filter */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search logs..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-48">
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="all">All Events</option>
                            {uniqueEventTypes.map(type => (
                              <option key={type} value={type}>
                                {type.replace('_', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Audit Log Entries */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredAuditLogs.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No audit logs found matching the current filters.
                          </div>
                        ) : (
                          filteredAuditLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-white/30 border hover:bg-white/50 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge className={getEventTypeColor(log.event_type)} variant="outline">
                                  {log.event_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-sm font-medium">{log.user_id}</span>
                                {log.session_id && (
                                  <span className="text-xs text-muted-foreground">
                                    Session: {log.session_id.slice(0, 8)}
                                  </span>
                                )}
                                {log.details && (
                                  <span className="text-xs text-muted-foreground truncate max-w-40">
                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(log.timestamp)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}