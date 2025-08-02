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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [sqlFormatted, setSqlFormatted] = useState(true)

  // Simple SQL formatter
  const formatSql = (sql: string) => {
    if (!sql) return ''
    
    return sql
      .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ON|AS|AND|OR|IN|NOT|EXISTS|LIKE|BETWEEN|IS|NULL|DISTINCT|LIMIT|OFFSET)\b/gi, '\n$1')
      .replace(/,/g, ',\n  ')
      .replace(/\(/g, '(\n  ')
      .replace(/\)/g, '\n)')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .replace(/^\n+|\n+$/g, '')
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    if (confidence >= 0.7) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  }

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
    } catch (err: any) {
      setError(err.message || 'Network error: Unable to execute query')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Confidence Score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">🔍 Query Preview</h3>
              <p className="text-sm text-gray-600">Review the generated SQL before execution</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getConfidenceColor(preview.confidence)}`}>
            {getConfidenceIcon(preview.confidence)}
            <span className="text-sm font-semibold">
              {Math.round(preview.confidence * 100)}% Confidence
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ AI Generated
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔒 Read-Only
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            ⚙️ Editable
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Explanation Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Query Explanation</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{preview.explanation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings Section */}
        {preview.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-amber-900 mb-3">⚠️ Important Warnings</h4>
                <ul className="space-y-2">
                  {preview.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-amber-800">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SQL Editor Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Generated SQL</h4>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSqlFormatted(!sqlFormatted)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  sqlFormatted
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sqlFormatted ? '✓ Formatted' : 'Raw'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              >
                {showAdvanced ? 'Basic' : 'Advanced'}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={sqlFormatted ? formatSql(editedSql) : editedSql}
              onChange={(e) => setEditedSql(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50"
              placeholder="SQL query will appear here..."
              spellCheck={false}
            />
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(editedSql)
                  // Could add a toast notification here
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy SQL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex items-start space-x-2 text-xs text-gray-600">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">You can edit the SQL before executing</p>
              <p>Only SELECT queries are allowed for data safety. DDL/DML operations are blocked.</p>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Query Analysis</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Estimated Complexity</p>
                  <p className="text-gray-600 mt-1">
                    {editedSql.toLowerCase().includes('join') ? 'High' : 
                     editedSql.toLowerCase().includes('group by') ? 'Medium' : 'Low'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Query Type</p>
                  <p className="text-gray-600 mt-1">
                    {editedSql.toLowerCase().includes('count') ? 'Aggregation' :
                     editedSql.toLowerCase().includes('join') ? 'Join Query' :
                     editedSql.toLowerCase().includes('where') ? 'Filtered Select' : 'Simple Select'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-700">Safety Level</p>
                  <p className="text-green-600 mt-1 font-medium">✓ Read-Only Safe</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Execution Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Execute Query
              </>
            )}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setEditedSql(preview.sql_generated)}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium hover:shadow-sm"
              title="Reset to original generated SQL"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            
            <button
              onClick={() => setEditedSql('')}
              className="px-4 py-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all duration-200 font-medium hover:shadow-sm"
              title="Clear SQL editor"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}