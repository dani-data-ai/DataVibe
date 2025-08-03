'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Database,
  Play,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'

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

interface SchemaDetailProps {
  proposal: Proposal
  onBack?: () => void
  onUpdate?: () => void
  sessionId?: string
}

export default function SchemaDetail({ proposal, onBack, onUpdate, sessionId }: SchemaDetailProps) {
  const { user } = useAuth()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = user?.user_metadata?.role === 'admin'
  const canApprove = isAdmin && proposal.status === 'pending'
  const canExecute = isAdmin && proposal.status === 'approved' && sessionId

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      setError('')
      await api.post(`/schema/proposals/${proposal.id}/approve`, {
        execute_immediately: false
      })
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve proposal')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Reason for rejection (optional):')
    try {
      setIsRejecting(true)
      setError('')
      await api.post(`/schema/proposals/${proposal.id}/reject`, {
        reason: reason || ''
      })
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject proposal')
    } finally {
      setIsRejecting(false)
    }
  }

  const handleExecute = async () => {
    if (!sessionId) {
      setError('Session ID is required for execution')
      return
    }

    const confirmed = confirm(
      'Are you sure you want to execute this schema change? This action cannot be undone.'
    )
    
    if (!confirmed) return

    try {
      setIsExecuting(true)
      setError('')
      await api.post(`/schema/proposals/${proposal.id}/approve`, {
        execute_immediately: true,
        session_id: sessionId
      })
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute proposal')
    } finally {
      setIsExecuting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadSQL = () => {
    const blob = new Blob([proposal.migration_sql], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema-proposal-${proposal.id}.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">Schema Proposal</h1>
            <p className="text-muted-foreground">ID: {proposal.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {(canApprove || canExecute) && (
          <div className="flex gap-3">
            {canApprove && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {isApproving ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {isRejecting ? 'Rejecting...' : 'Reject'}
                </Button>
              </>
            )}
            
            {canExecute && (
              <Button
                onClick={handleExecute}
                disabled={isExecuting}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                {isExecuting ? 'Executing...' : 'Execute Now'}
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Status and Metadata */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">Schema Change Request</CardTitle>
              <CardDescription>{proposal.natural_language}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span className="text-muted-foreground">{formatDate(proposal.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Requested by:</span>
                <span className="text-muted-foreground">{proposal.user_id}</span>
              </div>
            </div>

            {(proposal.approved_by || proposal.approved_at) && (
              <div className="space-y-3">
                {proposal.approved_by && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Approved by:</span>
                    <span className="text-muted-foreground">{proposal.approved_by}</span>
                  </div>
                )}
                
                {proposal.approved_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Approved:</span>
                    <span className="text-muted-foreground">{formatDate(proposal.approved_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      {proposal.explanation && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{proposal.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Migration SQL */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Migration SQL
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(proposal.migration_sql)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSQL}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-gray-50 text-sm overflow-x-auto border">
            {proposal.migration_sql}
          </pre>
        </CardContent>
      </Card>

      {/* Warnings */}
      {proposal.warnings && proposal.warnings.length > 0 && (
        <Card className="glass-effect border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {proposal.rejection_reason && (
        <Card className="glass-effect border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Rejection Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{proposal.rejection_reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}