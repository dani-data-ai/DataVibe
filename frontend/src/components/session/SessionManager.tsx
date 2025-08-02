'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Session {
  session_id: string
  name: string
  provider: string
  created_at: string
  last_used: string
  status: 'active' | 'expired' | 'error'
}

interface SessionManagerProps {
  currentSessionId?: string
  onSessionChange?: (sessionId: string | null) => void
}

export default function SessionManager({ currentSessionId, onSessionChange }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSessions, setShowSessions] = useState(false)

  useEffect(() => {
    if (showSessions) {
      loadSessions()
    }
  }, [showSessions])

  const loadSessions = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await api.listSessions()
      setSessions(result.sessions || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!currentSessionId) return
    
    try {
      await api.destroySession(currentSessionId)
      if (onSessionChange) {
        onSessionChange(null)
      }
      // Refresh sessions list
      if (showSessions) {
        loadSessions()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect session')
    }
  }

  const handleSwitchSession = (sessionId: string) => {
    if (onSessionChange) {
      onSessionChange(sessionId)
    }
    setShowSessions(false)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        )
      case 'expired':
        return (
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        )
      case 'error':
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        )
      default:
        return (
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        )
    }
  }

  if (!currentSessionId) {
    return null
  }

  return (
    <div className="relative">
      {/* Current Session Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Database Connected</h4>
              <p className="text-xs text-gray-600">Session active • Secure connection</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg transition-colors font-medium"
              title="Manage sessions"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Manage
            </button>
            <button
              onClick={handleDisconnect}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg transition-colors font-medium"
              title="Disconnect from database"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List Modal */}
      {showSessions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-80 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-900">Session Management</h5>
              <button
                onClick={() => setShowSessions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Manage your database connections and switch between sessions
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <svg className="animate-spin h-6 w-6 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-500">Loading sessions...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={loadSessions}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Try Again
                </button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-1.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H8" />
                </svg>
                <p className="text-sm text-gray-500">No sessions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      session.session_id === currentSessionId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(session.status)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {session.name}
                            </p>
                            {session.session_id === currentSessionId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">{session.provider}</p>
                            <p className="text-xs text-gray-500">
                              Last used {formatTimeAgo(session.last_used)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {session.session_id !== currentSessionId && session.status === 'active' && (
                          <button
                            onClick={() => handleSwitchSession(session.session_id)}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Implement session deletion
                            console.log('Delete session:', session.session_id)
                          }}
                          className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Sessions expire after 1 hour of inactivity</span>
              <button
                onClick={loadSessions}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}