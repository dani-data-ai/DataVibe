'use client'

import { useState } from 'react'

interface QueryPreview {
  query_id: string
  sql_generated: string
  explanation: string
  warnings: string[]
  confidence: number
}

interface QueryInputProps {
  connectionString: string
  onQueryPreview: (preview: QueryPreview) => void
}

export default function QueryInput({ connectionString, onQueryPreview }: QueryInputProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/query/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: query,
          connection_string: connectionString
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        onQueryPreview(result)
      } else {
        setError(result.detail || 'Failed to generate query preview')
      }
    } catch (err) {
      setError('Network error: Unable to process query')
    } finally {
      setIsLoading(false)
    }
  }

  if (!connectionString) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Ask a Question</h2>
        <p className="text-gray-500">Please connect to a database first to start querying.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">🤖 Ask a Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your data... e.g., 'Show me all customers from Germany' or 'How many orders were placed last month?'"
            className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 Examples: "Show me all customers", "Count total orders", "Find products with high prices"
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating SQL...' : 'Generate Query'}
        </button>
      </form>
    </div>
  )
}