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
          className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isLoading || !query.trim()
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
              Generating SQL...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Query
            </>
          )}
        </button>
      </form>
    </div>
  )
}