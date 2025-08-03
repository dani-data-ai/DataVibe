'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, ExternalLink, Check, AlertCircle, Loader2, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, endpoints } from '@/lib/api'

interface Provider {
  name: string
  description: string
  url: string
  connection_format: string
  free_tier: boolean
}

export default function ConnectionForm({ onConnectionSuccess }: { onConnectionSuccess?: (sessionId: string) => void }) {
  const [connectionString, setConnectionString] = useState('')
  const [connectionName, setConnectionName] = useState('')
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testSuccess, setTestSuccess] = useState('')
  const [showProviders, setShowProviders] = useState(false)
  
  const providers: Provider[] = [
    {
      name: "Neon",
      description: "Serverless PostgreSQL with generous free tier",
      url: "https://neon.tech",
      connection_format: "postgresql://username:password@hostname.neon.tech/database",
      free_tier: true
    },
    {
      name: "Supabase",
      description: "Open source Firebase alternative with PostgreSQL",
      url: "https://supabase.com",
      connection_format: "postgresql://postgres:password@hostname.supabase.co:5432/postgres",
      free_tier: true
    },
    {
      name: "PlanetScale",
      description: "MySQL-compatible serverless database platform",
      url: "https://planetscale.com",
      connection_format: "mysql://username:password@hostname.psdb.cloud/database",
      free_tier: true
    }
  ]

  // Connection string validation
  const isValidConnectionString = (str: string): boolean => {
    if (!str.trim()) return false
    
    // Basic format check for common database connection strings
    const patterns = [
      /^postgresql:\/\/.+@.+\/.+$/,     // PostgreSQL
      /^mysql:\/\/.+@.+\/.+$/,         // MySQL
      /^postgres:\/\/.+@.+\/.+$/       // Postgres alias
    ]
    
    return patterns.some(pattern => pattern.test(str.trim()))
  }

  const isValidConnection = isValidConnectionString(connectionString)

  const handleTestConnection = async () => {
    if (!isValidConnection) return
    
    setTestLoading(true)
    setError('')
    setTestSuccess('')
    
    try {
      const result = await api.post(endpoints.database.testConnection, {
        connection_string: connectionString,
        name: connectionName || 'Test Connection'
      })
      
      if (result.success) {
        setTestSuccess(`✅ Connection successful! Provider: ${result.provider || 'Unknown'}`)
      } else {
        setError(result.message || 'Connection test failed')
      }
    } catch (err: any) {
      setError(err.message || 'Network error: Unable to test connection')
    } finally {
      setTestLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setTestSuccess('')

    try {
      const result = await api.createSession({
        connection_string: connectionString,
        name: connectionName || 'Test Connection'
      })
      
      if (result.session_id) {
        setSuccess(`✅ Connected successfully to ${result.provider || 'database'}!`)
        if (onConnectionSuccess) {
          onConnectionSuccess(result.session_id)
        }
      } else {
        setError(result.message || 'Connection failed')
      }
    } catch (err) {
      setError('Network error: Unable to test connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Cloud-Only Architecture</h3>
              <p className="text-sm text-blue-700 mb-3">
                DataVibe only connects to remote cloud databases. Use free-tier providers like Neon, Supabase, or PlanetScale for secure, read-only access.
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="info">🔒 Read-Only</Badge>
                <Badge variant="success">🆓 Free Tier</Badge>
                <Badge variant="default">☁️ Cloud Only</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowProviders(!showProviders)}
                className="text-blue-600 hover:text-blue-800 h-auto p-0 gap-1"
              >
                {showProviders ? (
                  <>
                    Hide providers
                  </>
                ) : (
                  <>
                    Show supported providers
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showProviders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Free Tier Providers</h4>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
              {providers.map((provider, index) => (
                <motion.div
                  key={provider.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-all duration-200 hover:border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{provider.name[0]}</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">{provider.name}</h5>
                        </div>
                        <Badge variant="success">FREE</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{provider.description}</p>
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-mono text-gray-700 break-all">{provider.connection_format}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-auto p-0 text-blue-600 hover:text-blue-800"
                      >
                        <a 
                          href={provider.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          Visit {provider.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
            >
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="whitespace-pre-line text-sm leading-relaxed">{error}</div>
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
            >
              <Check className="w-5 h-5 mr-2 text-green-600" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-2">
          <label htmlFor="connectionName" className="block text-sm font-semibold text-gray-700">
            Connection Name
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <Input
            type="text"
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My Database Connection"
            disabled={loading || testLoading}
          />
          <p className="text-xs text-muted-foreground">
            Give your connection a memorable name for easier reference
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="connectionString" className="block text-sm font-semibold text-gray-700">
            Database Connection String
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <textarea
              id="connectionString"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://username:password@hostname.neon.tech/database"
              className={`block w-full rounded-lg px-4 py-3 shadow-sm transition-all duration-200 resize-none border focus:outline-none focus:ring-2 ${
                !connectionString.trim() 
                  ? 'border-input hover:border-primary/50 focus:border-primary focus:ring-ring/20' 
                  : isValidConnection
                    ? 'border-green-300 bg-green-50/30 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-amber-300 bg-amber-50/30 focus:border-amber-500 focus:ring-amber-500/20'
              }`}
              rows={3}
              required
              disabled={loading || testLoading}
              aria-describedby="connection-string-help"
            />
            <div className="absolute top-3 right-3">
              {connectionString.trim() && (
                isValidConnection ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )
              )}
            </div>
          </div>
          <div className="flex items-start space-x-2 text-xs">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p id="connection-string-help" className="text-muted-foreground">
              Enter your complete database connection string from your cloud provider. This will be encrypted and never stored permanently.
            </p>
          </div>
        </div>
        
        {/* Test Connection Button */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleTestConnection}
            disabled={testLoading || !isValidConnection}
            size="lg"
            className="w-full"
            variant={testLoading || !isValidConnection ? "secondary" : "default"}
          >
            {testLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Test Connection
              </>
            )}
          </Button>
          
          {!isValidConnection && connectionString.trim() && (
            <p className="text-xs text-amber-600 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Invalid connection string format
            </p>
          )}
          
          {!connectionString.trim() && (
            <p className="text-xs text-muted-foreground text-center">
              Enter a valid connection string to enable testing
            </p>
          )}
        </div>
        
        {/* Test Success Message */}
        <AnimatePresence>
          {testSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
            >
              <Check className="w-5 h-5 mr-2 text-green-600" />
              {testSuccess}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Create Session Button - Only show after successful test */}
        <AnimatePresence>
          {testSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                variant="gradient"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Create Session & Continue
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}