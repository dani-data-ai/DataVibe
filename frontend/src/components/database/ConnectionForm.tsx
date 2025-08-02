'use client'

import { useState } from 'react'

interface Provider {
  name: string
  description: string
  url: string
  connection_format: string
  free_tier: boolean
}

export default function ConnectionForm({ onConnectionSuccess }: { onConnectionSuccess?: (connectionString: string) => void }) {
  const [connectionString, setConnectionString] = useState('')
  const [connectionName, setConnectionName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/database/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connection_string: connectionString,
          name: connectionName || 'Test Connection'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess(`✅ Connected successfully to ${result.provider}!`)
        if (onConnectionSuccess) {
          onConnectionSuccess(connectionString)
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
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">☁️ Cloud-Only Architecture</h3>
        <p className="text-sm text-blue-700">
          DataVibe only connects to remote cloud databases. Use free-tier providers like Neon, Supabase, or PlanetScale.
        </p>
        <button
          type="button"
          onClick={() => setShowProviders(!showProviders)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showProviders ? 'Hide' : 'Show'} supported providers
        </button>
      </div>

      {showProviders && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Free Tier Providers:</h4>
          {providers.map((provider) => (
            <div key={provider.name} className="border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">{provider.name}</h5>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">FREE</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">{provider.connection_format}</p>
              <a 
                href={provider.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Visit {provider.name} →
              </a>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        
        <div>
          <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700">
            Connection Name (optional)
          </label>
          <input
            type="text"
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="My Database"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700">
            Database Connection String *
          </label>
          <textarea
            id="connectionString"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            placeholder="postgresql://username:password@hostname.neon.tech/database"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows={3}
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your complete database connection string from your cloud provider
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading || !connectionString.trim()}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing Connection...' : 'Test Connection'}
        </button>
      </form>
    </div>
  )
}