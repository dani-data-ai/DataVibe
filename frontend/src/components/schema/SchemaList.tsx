'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Loader2,
  RefreshCw,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Proposal {
  id: string
  user_id: string
  natural_language: string
  migration_sql: string
  explanation: string
  environment: string
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  requires_approval: boolean
  created_at: string
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  warnings: string[]
}

interface SchemaListProps {
  onSelectProposal?: (proposal: Proposal) => void
  refreshTrigger?: number
}

export default function SchemaList({ onSelectProposal, refreshTrigger }: SchemaListProps) {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const isAdmin = user?.user_metadata?.role === 'admin'

  const fetchProposals = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await api.get('/schema/proposals')
      setProposals(response.proposals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [refreshTrigger])

  const handleApprove = async (proposalId: string) => {
    try {
      await api.post(`/schema/proposals/${proposalId}/approve`, {
        execute_immediately: false
      })
      await fetchProposals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve proposal')
    }
  }

  const handleReject = async (proposalId: string) => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      await api.post(`/schema/proposals/${proposalId}/reject`, {
        reason: reason || ''
      })
      await fetchProposals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject proposal')
    }
  }

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true
    return proposal.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'executed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'executed': return <CheckCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading proposals...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Schema Proposals</h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all schema change proposals' : 'View your schema change proposals'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProposals}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/50 rounded-lg border">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(status)}
            className="flex-1 capitalize gap-2"
          >
            <Filter className="w-4 h-4" />
            {status}
            <Badge variant="secondary" className="ml-1">
              {status === 'all' ? proposals.length : proposals.filter(p => p.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredProposals.length === 0 ? (
            <Card className="glass-effect">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No proposals found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'all' 
                    ? 'No schema proposals have been created yet.'
                    : `No ${filter} proposals found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProposals.map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <Card className="glass-effect hover-lift cursor-pointer" onClick={() => {
                  setSelectedProposal(proposal)
                  onSelectProposal?.(proposal)
                }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getStatusColor(proposal.status)}>
                            {getStatusIcon(proposal.status)}
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </Badge>
                          
                          <Badge variant={proposal.environment === 'production' ? 'destructive' : 'default'}>
                            {proposal.environment.toUpperCase()}
                          </Badge>
                          
                          {proposal.requires_approval && (
                            <Badge variant="secondary">
                              Requires Approval
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg line-clamp-2">
                          {proposal.natural_language}
                        </CardTitle>
                        
                        <CardDescription className="mt-1">
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              ID: {proposal.id.slice(0, 8)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(proposal.created_at)}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                      
                      {isAdmin && proposal.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(proposal.id)
                            }}
                            className="gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReject(proposal.id)
                            }}
                            className="gap-1"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {proposal.explanation && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {proposal.explanation}
                      </p>
                    )}
                    
                    {proposal.warnings && proposal.warnings.length > 0 && (
                      <div className="flex items-center gap-2 text-amber-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{proposal.warnings.length} warning(s)</span>
                      </div>
                    )}

                    {proposal.rejection_reason && (
                      <div className="mt-3 p-2 rounded bg-red-50 border border-red-200">
                        <div className="text-xs text-red-600 font-medium">Rejection Reason:</div>
                        <div className="text-xs text-red-700">{proposal.rejection_reason}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}