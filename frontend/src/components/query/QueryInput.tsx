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

interface QueryInputProps {
  sessionId: string
  onQueryPreview: (preview: QueryPreview) => void
}

export default function QueryInput({ sessionId, onQueryPreview }: QueryInputProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [queryType, setQueryType] = useState<'natural' | 'sql'>('natural')

  const queryTemplates = [
    {
      category: 'Basic Queries',
      templates: [
        { name: 'Show all records', query: 'Show me all records from [table_name]' },
        { name: 'Count records', query: 'How many records are in [table_name]?' },
        { name: 'Find specific records', query: 'Show me all [table_name] where [column] equals [value]' },
        { name: 'Recent records', query: 'Show me the most recent 10 records from [table_name]' }
      ]
    },
    {
      category: 'Analytics',
      templates: [
        { name: 'Group by analysis', query: 'Show me the count of records grouped by [column] from [table_name]' },
        { name: 'Top performers', query: 'Show me the top 10 [table_name] ordered by [column] descending' },
        { name: 'Average calculation', query: 'What is the average [column] in [table_name]?' },
        { name: 'Date range analysis', query: 'Show me all [table_name] created between [start_date] and [end_date]' }
      ]
    },
    {
      category: 'Data Exploration',
      templates: [
        { name: 'Unique values', query: 'Show me all unique values in [column] from [table_name]' },
        { name: 'Empty values check', query: 'Show me records where [column] is empty or null in [table_name]' },
        { name: 'Pattern matching', query: 'Show me all [table_name] where [column] contains [pattern]' },
        { name: 'Join tables', query: 'Show me data from [table1] joined with [table2] on [join_condition]' }
      ]
    }
  ]

  const validateQuery = (queryText: string) => {
    if (!queryText.trim()) return null
    
    if (queryType === 'sql') {
      // Basic SQL validation
      const sqlQuery = queryText.trim().toLowerCase()
      if (!sqlQuery.startsWith('select')) {
        return 'Only SELECT queries are allowed for security reasons'
      }
      if (sqlQuery.includes('drop') || sqlQuery.includes('delete') || sqlQuery.includes('insert') || sqlQuery.includes('update')) {
        return 'DDL and DML operations are not allowed - read-only access only'
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const validationError = validateQuery(query)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const result = await api.generateQuery({
        session_id: sessionId,
        prompt: query
      })
      
      onQueryPreview(result)
    } catch (err: any) {
      setError(err.message || 'Network error: Unable to process query')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: string) => {
    setQuery(template)
    setShowTemplates(false)
  }

  const handleClearQuery = () => {
    setQuery('')
    setError('')
  }

  if (!sessionId) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Query</h3>
          <p className="text-gray-500 mb-4">
            Connect to your database first to start asking questions and generating insights from your data.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span>Step 1: Connect</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-600">Step 2: Query</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Query Type Selector */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">🤖 Ask a Question</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Query Type:</span>
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setQueryType('natural')}
                className={`px-3 py-1 text-sm font-medium transition-all duration-200 rounded-md ${
                  queryType === 'natural'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Natural Language
              </button>
              <button
                type="button"
                onClick={() => setQueryType('sql')}
                className={`px-3 py-1 text-sm font-medium transition-all duration-200 rounded-md ${
                  queryType === 'sql'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Direct SQL
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🔒 Read-Only
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✨ AI-Powered
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            🛡️ Safe Execution
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start animate-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Query Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Query Input Area */}
          <div className="relative">
            <label htmlFor="query-input" className="block text-sm font-semibold text-gray-700 mb-2">
              {queryType === 'natural' ? 'Natural Language Query' : 'SQL Query'}
            </label>
            <div className="relative">
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={queryType === 'natural' 
                  ? "Ask anything about your data... e.g., 'Show me all customers from Germany' or 'How many orders were placed last month?'"
                  : "SELECT * FROM table_name WHERE condition..."}
                className={`w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  queryType === 'sql' ? 'font-mono text-sm' : ''
                } ${validateQuery(query) ? 'border-red-300 bg-red-50/30' : ''}`}
                disabled={isLoading}
                aria-describedby="query-help"
              />
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                {query.trim() && (
                  <button
                    type="button"
                    onClick={handleClearQuery}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear query"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Query Help */}
            <div id="query-help" className="mt-2 space-y-2">
              {queryType === 'natural' ? (
                <div className="flex items-start space-x-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Tip: Use natural language to describe what you want to find</p>
                    <p>Examples: "customers from Germany", "orders this month", "top selling products"</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-medium">Security: Only SELECT statements are allowed</p>
                    <p>DDL/DML operations (CREATE, DROP, INSERT, UPDATE, DELETE) are blocked for data safety</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Templates Section */}
          {queryType === 'natural' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                {showTemplates ? (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide query templates
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show query templates
                  </>
                )}
              </button>
              
              {showTemplates && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Query Templates</h4>
                  <div className="space-y-4">
                    {queryTemplates.map((category) => (
                      <div key={category.category}>
                        <h5 className="text-xs font-medium text-gray-700 mb-2">{category.category}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {category.templates.map((template) => (
                            <button
                              key={template.name}
                              type="button"
                              onClick={() => handleTemplateSelect(template.query)}
                              className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                                    {template.name}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1 truncate">
                                    {template.query}
                                  </p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    💡 Replace [table_name], [column], and [value] with your actual database schema
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim() || !!validateQuery(query)}
          className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isLoading || !query.trim() || validateQuery(query)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {queryType === 'natural' ? 'Generating SQL...' : 'Processing Query...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {queryType === 'natural' ? 'Generate Query' : 'Execute Query'}
            </>
          )}
        </button>
      </form>
    </div>
  )
}