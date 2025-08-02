'use client'

import { useState, useMemo } from 'react'

interface QueryResult {
  success: boolean
  data: any[]
  columns: string[]
  row_count: number
  explanation: string
  follow_up_suggestions: string[]
}

interface QueryResultsProps {
  result: QueryResult
  sqlQuery?: string
}

export default function QueryResults({ result, sqlQuery }: QueryResultsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(25)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterText, setFilterText] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'json'>('table')
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-4">
            Your query executed successfully but returned no data. Try adjusting your filters or query criteria.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Query executed successfully</span>
          </div>
        </div>
      </div>
    )
  }

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = result.data

    // Apply text filter
    if (filterText) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(filterText.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        
        if (aVal === bVal) return 0
        
        let comparison = 0
        if (aVal === null || aVal === undefined) comparison = 1
        else if (bVal === null || bVal === undefined) comparison = -1
        else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }
        
        return sortDirection === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }, [result.data, filterText, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleRowSelect = (rowIndex: number) => {
    const globalIndex = startIndex + rowIndex
    setSelectedRows(prev =>
      prev.includes(globalIndex)
        ? prev.filter(i => i !== globalIndex)
        : [...prev, globalIndex]
    )
  }

  const handleSelectAll = () => {
    const pageIndices = Array.from({ length: paginatedData.length }, (_, i) => startIndex + i)
    const allSelected = pageIndices.every(i => selectedRows.includes(i))
    
    if (allSelected) {
      setSelectedRows(prev => prev.filter(i => !pageIndices.includes(i)))
    } else {
      setSelectedRows(prev => Array.from(new Set([...prev, ...pageIndices])))
    }
  }

  const downloadCSV = (selectedOnly = false) => {
    const dataToExport = selectedOnly && selectedRows.length > 0
      ? selectedRows.map(i => filteredData[i])
      : filteredData

    const headers = result.columns.join(',')
    const csvContent = dataToExport.map(row => 
      result.columns.map(col => {
        const value = row[col]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    ).join('\n')
    
    const fullCsv = headers + '\n' + csvContent
    const blob = new Blob([fullCsv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_results_${selectedOnly ? 'selected_' : ''}${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = (selectedOnly = false) => {
    const dataToExport = selectedOnly && selectedRows.length > 0
      ? selectedRows.map(i => filteredData[i])
      : filteredData

    const jsonContent = JSON.stringify(dataToExport, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query_results_${selectedOnly ? 'selected_' : ''}${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">📊 Query Results</h3>
              <p className="text-sm text-gray-600">
                {filteredData.length} of {result.row_count} rows
                {selectedRows.length > 0 && ` • ${selectedRows.length} selected`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Success
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🔒 Read-Only
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-700">
          <p>{result.explanation}</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search in results..."
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['table', 'cards', 'json'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-xs font-medium transition-all duration-200 rounded-md ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export and Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadCSV(false)}
                className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg transition-colors font-medium"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => downloadJSON(false)}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg transition-colors font-medium"
              >
                📄 Export JSON
              </button>
              {selectedRows.length > 0 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => downloadCSV(true)}
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition-colors"
                  >
                    Selected CSV
                  </button>
                  <button
                    onClick={() => downloadJSON(true)}
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition-colors"
                  >
                    Selected JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every((_, i) => selectedRows.includes(startIndex + i))}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  {result.columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column}</span>
                        {sortColumn === column && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`${
                      selectedRows.includes(startIndex + index) ? 'bg-blue-50' : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(startIndex + index)}
                        onChange={() => handleRowSelect(index)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    {result.columns.map((column) => (
                      <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[column] === null ? (
                          <span className="text-gray-400 italic">null</span>
                        ) : row[column] === '' ? (
                          <span className="text-gray-400 italic">empty</span>
                        ) : (
                          String(row[column])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((row, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    selectedRows.includes(startIndex + index) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  } hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Row {startIndex + index + 1}</span>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(startIndex + index)}
                      onChange={() => handleRowSelect(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    {result.columns.map((column) => (
                      <div key={column} className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-500 mr-2">{column}:</span>
                        <span className="text-sm text-gray-900 text-right">
                          {row[column] === null ? (
                            <span className="text-gray-400 italic">null</span>
                          ) : row[column] === '' ? (
                            <span className="text-gray-400 italic">empty</span>
                          ) : (
                            String(row[column])
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'json' && (
          <div className="p-6">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(paginatedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* SQL Query Display */}
      {sqlQuery && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center justify-between hover:text-gray-900">
              <span>View Executed SQL</span>
              <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <pre className="text-sm font-mono overflow-x-auto text-gray-800">
                <code>{sqlQuery}</code>
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Follow-up Suggestions */}
      {result.follow_up_suggestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">💡 Follow-up Questions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.follow_up_suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-left p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                    onClick={() => {
                      // Could trigger new query with this suggestion
                      console.log('Suggested query:', suggestion)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-blue-800 group-hover:text-blue-900">
                        "{suggestion}"
                      </span>
                      <svg className="w-4 h-4 text-blue-500 group-hover:text-blue-600 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}