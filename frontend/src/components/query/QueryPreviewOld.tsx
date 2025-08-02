'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface QueryPreview {
  query_id: string
  sql_generated: string
  explanation: string
  warnings: string[]
  confidence: number
}

interface QueryPreviewProps {
  preview: QueryPreview
  sessionId: string
  onExecute: (result: any) => void
}

export default function QueryPreview({ preview, sessionId, onExecute }: QueryPreviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editedSql, setEditedSql] = useState(preview.sql_generated)

  const handleExecute = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await api.executeQuery({
        session_id: sessionId,
        query_id: preview.query_id,
        sql_query: editedSql,
        confirm_execution: true
      })
      
      onExecute(result)
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExecute}
            disabled={loading || !editedSql.trim()}
            className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
              loading || !editedSql.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Executing Query...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-7-9h6a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
                Execute Query
              </>
            )}
          </button>
          <button
            onClick={() => setEditedSql(preview.sql_generated)}
            className="sm:w-auto px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset SQL
          </button>
        </div>
      </div>
    </div>
  )
}