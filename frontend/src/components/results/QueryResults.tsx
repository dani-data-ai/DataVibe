'use client'

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
  if (!result.success || !result.data || result.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Query Results</h3>
        <p className="text-gray-500 text-center">No results found for your query.</p>
      </div>
    )
  }

  const downloadCSV = () => {
    const headers = result.columns.join(',')
    const csvContent = result.data.map(row => 
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
    a.download = 'query_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📊 Query Results</h3>
          <span className="text-sm text-gray-500">
            {result.row_count} {result.row_count === 1 ? 'row' : 'rows'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{result.explanation}</p>
        
        {sqlQuery && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              View Executed SQL
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-md text-sm overflow-x-auto">
              <code>{sqlQuery}</code>
            </pre>
          </details>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {result.columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {result.columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row[column]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {result.data.length} of {result.row_count} results
        </div>
        <button 
          onClick={downloadCSV}
          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded"
        >
          📥 Export CSV
        </button>
      </div>

      {result.follow_up_suggestions.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Follow-up Questions</h4>
          <div className="space-y-2">
            {result.follow_up_suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="block text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded"
                onClick={() => {
                  // Could trigger new query with this suggestion
                  console.log('Suggested query:', suggestion)
                }}
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}