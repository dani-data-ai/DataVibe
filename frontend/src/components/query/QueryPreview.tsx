'use client'

import { useState } from 'react'

interface QueryPreview {
  query_id: string
  sql_generated: string
  explanation: string
  warnings: string[]
  confidence: number
}

interface QueryPreviewProps {
  preview: QueryPreview
  connectionString: string
  onExecute: (result: any) => void
}

export default function QueryPreview({ preview, connectionString, onExecute }: QueryPreviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editedSql, setEditedSql] = useState(preview.sql_generated)

  const handleExecute = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: preview.query_id,
          connection_string: connectionString,
          sql_query: editedSql,
          confirm_execution: true
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        onExecute(result)
      } else {
        setError(result.detail || 'Query execution failed')
      }
    } catch (err) {
      setError('Network error: Unable to execute query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🔍 Query Preview</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Confidence:</span>
          <span className={`text-sm font-medium ${preview.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
            {Math.round(preview.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{preview.explanation}</p>
        </div>

        {preview.warnings.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-700 mb-2">⚠️ Warnings</h4>
            <ul className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded space-y-1">
              {preview.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated SQL</h4>
          <textarea
            value={editedSql}
            onChange={(e) => setEditedSql(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="SQL query will appear here..."
          />
          <p className="mt-1 text-xs text-gray-500">
            You can edit the SQL before executing. Only SELECT queries are allowed.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleExecute}
            disabled={loading || !editedSql.trim()}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Executing...' : '▶️ Execute Query'}
          </button>
          <button
            onClick={() => setEditedSql(preview.sql_generated)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Reset SQL
          </button>
        </div>
      </div>
    </div>
  )
}