'use client'

import { useState } from 'react'

interface HelpTopic {
  id: string
  title: string
  category: string
  content: string
  tags: string[]
}

interface HelpSystemProps {
  currentStep?: string
  className?: string
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with DataVibe',
    category: 'Basics',
    content: `
# Getting Started

DataVibe is a cloud-only, AI-powered database querying tool. Here's how to get started:

## 1. Connect to Your Database
- Use a cloud database provider (Neon, Supabase, PlanetScale)
- Enter your connection string
- Test the connection before proceeding

## 2. Ask Questions
- Use natural language to query your data
- Try examples like "Show me all customers from Germany"
- Or write SQL directly if you prefer

## 3. Review & Execute
- Check the generated SQL
- Make edits if needed
- Execute with confidence - only read-only queries are allowed

## 4. Explore Results
- Sort, filter, and paginate through results
- Export data as CSV or JSON
- Use follow-up suggestions for deeper insights
    `,
    tags: ['beginner', 'overview', 'workflow']
  },
  {
    id: 'cloud-providers',
    title: 'Supported Cloud Database Providers',
    category: 'Connection',
    content: `
# Cloud Database Providers

DataVibe only connects to cloud-hosted databases for security and reliability.

## Free Tier Providers

### Neon
- **Type**: PostgreSQL
- **Free Tier**: 3 databases, 1GB storage
- **Connection**: postgresql://username:password@hostname.neon.tech/database
- **Website**: https://neon.tech

### Supabase
- **Type**: PostgreSQL
- **Free Tier**: 2 projects, 500MB database
- **Connection**: postgresql://postgres:password@hostname.supabase.co:5432/postgres
- **Website**: https://supabase.com

### PlanetScale
- **Type**: MySQL-compatible
- **Free Tier**: 1 database, 1GB storage
- **Connection**: mysql://username:password@hostname.psdb.cloud/database
- **Website**: https://planetscale.com

## Security Notes
- All connections are encrypted (SSL/TLS)
- No credentials are stored locally
- Sessions expire after 1 hour of inactivity
    `,
    tags: ['providers', 'connection', 'security', 'free-tier']
  },
  {
    id: 'natural-language',
    title: 'Natural Language Query Tips',
    category: 'Querying',
    content: `
# Natural Language Querying

DataVibe's AI can understand your questions and convert them to SQL.

## Best Practices

### Be Specific
- ❌ "Show me data"
- ✅ "Show me all customers from Germany"

### Use Clear Language
- ❌ "Get stuff from last week"
- ✅ "Show me orders created in the last 7 days"

### Mention Table Names
- ❌ "How many records?"
- ✅ "How many records are in the users table?"

## Common Patterns

### Basic Queries
- "Show me all [table_name]"
- "Count records in [table_name]"
- "Find [table_name] where [column] equals [value]"

### Filtering
- "Show me customers from Germany"
- "Find orders from the last month"
- "Get users with email containing gmail"

### Aggregation
- "What's the average price of products?"
- "Count orders by status"
- "Sum total revenue by month"

### Sorting & Limiting
- "Show me the top 10 highest prices"
- "Get recent orders sorted by date"
- "Find the oldest 5 users"
    `,
    tags: ['natural-language', 'ai', 'querying', 'examples']
  },
  {
    id: 'sql-editing',
    title: 'SQL Editor Features',
    category: 'Querying',
    content: `
# SQL Editor

The SQL editor provides powerful features for reviewing and editing queries.

## Features

### Syntax Formatting
- Toggle between formatted and raw SQL
- Automatic keyword highlighting
- Proper indentation and spacing

### Query Analysis
- **Complexity**: High (joins), Medium (aggregation), Low (simple select)
- **Type**: Join Query, Aggregation, Filtered Select, Simple Select
- **Safety**: Always read-only safe

### Copy & Reset
- Copy SQL to clipboard
- Reset to original generated SQL
- Clear editor completely

## Security Features

### Automatic Validation
- Only SELECT statements allowed
- DDL/DML operations blocked
- Prevents data modification

### Query Types Allowed
- ✅ SELECT with WHERE clauses
- ✅ JOINs between tables
- ✅ GROUP BY and aggregations
- ✅ ORDER BY and LIMIT

### Query Types Blocked
- ❌ INSERT, UPDATE, DELETE
- ❌ CREATE, DROP, ALTER
- ❌ TRUNCATE, REPLACE
- ❌ Administrative commands
    `,
    tags: ['sql', 'editor', 'security', 'formatting']
  },
  {
    id: 'results-features',
    title: 'Working with Query Results',
    category: 'Results',
    content: `
# Query Results Features

DataVibe provides powerful tools for analyzing your query results.

## View Modes

### Table View
- Traditional spreadsheet-like display
- Sortable columns (click headers)
- Row selection with checkboxes
- Pagination controls

### Card View
- Individual cards for each row
- Better for wide tables
- Mobile-friendly layout
- Easy to scan key-value pairs

### JSON View
- Raw JSON format
- Perfect for developers
- Copy-paste friendly
- Preserves data types

## Data Operations

### Searching
- Search across all columns
- Case-insensitive matching
- Instant filtering

### Sorting
- Click column headers to sort
- Toggle ascending/descending
- Smart sorting (numbers, dates, text)

### Selection
- Select individual rows
- Select all on current page
- Export selected data only

### Export Options
- **CSV**: Excel-compatible format
- **JSON**: Developer-friendly format
- Export all data or selected rows only
- Automatic filename with date

## Pagination
- Configurable page sizes (10, 25, 50, 100)
- Smart pagination controls
- Shows total count and current range
    `,
    tags: ['results', 'export', 'pagination', 'views']
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    category: 'Security',
    content: `
# Security & Privacy

DataVibe is designed with security and privacy as top priorities.

## Data Protection

### No Local Storage
- No data stored on your device
- No cached query results
- Sessions cleared on browser close

### Encrypted Connections
- All database connections use SSL/TLS
- Connection strings encrypted server-side
- JWT tokens for session management

### Read-Only Access
- Only SELECT queries allowed
- No data modification possible
- No administrative operations

## Session Management

### Automatic Expiration
- Sessions expire after 1 hour of inactivity
- Automatic cleanup of encrypted data
- Manual disconnect available anytime

### Multi-Session Support
- Switch between database connections
- Independent session management
- No cross-session data leaks

## Cloud-Only Architecture

### No Local Services
- No local database required
- No Docker containers
- Browser-only operation

### Secure API Communication
- HTTPS-only API calls
- No credentials in frontend
- Stateless authentication

## Compliance

### Data Handling
- No PII storage
- No query history persistence
- Temporary processing only

### Audit Trail
- Query logging (without data)
- Session activity tracking
- Error monitoring
    `,
    tags: ['security', 'privacy', 'compliance', 'encryption']
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Common Issues',
    category: 'Support',
    content: `
# Troubleshooting

Common issues and their solutions.

## Connection Problems

### "Connection failed" Error
1. **Check connection string format**
   - Ensure it matches provider format
   - Include username, password, hostname, database
   
2. **Verify database access**
   - Test connection from database provider dashboard
   - Check firewall settings allow external connections
   
3. **Provider-specific issues**
   - Neon: Ensure database is not suspended
   - Supabase: Check project is active
   - PlanetScale: Verify branch exists

### "Invalid connection string" Warning
- Connection string must start with protocol (postgresql://, mysql://)
- Must include all required components
- Special characters need proper encoding

## Query Issues

### "Only SELECT queries allowed"
- DataVibe only supports read-only operations
- Use SELECT statements only
- Avoid INSERT, UPDATE, DELETE, CREATE, DROP

### "Query generation failed"
- Be more specific in natural language
- Include table names in your question
- Try rephrasing your request
- Switch to direct SQL mode

### "No results found"
- Check if table/column names are correct
- Verify filter conditions
- Try broader search criteria
- Use natural language to explore schema

## Session Issues

### "Session expired"
- Sessions automatically expire after 1 hour
- Click "Change Database" to reconnect
- Previous queries are not saved

### "Authentication failed"
- Sign out and sign back in
- Clear browser cache if issues persist
- Check network connectivity

## Performance

### Slow query responses
- Large result sets take longer to process
- Consider adding LIMIT clauses
- Use more specific WHERE conditions
- Complex JOINs increase processing time

### Export timeouts
- Large exports may timeout
- Try exporting smaller datasets
- Use pagination and export in batches
    `,
    tags: ['troubleshooting', 'errors', 'connection', 'queries']
  }
]

export default function HelpSystem({ currentStep, className = '' }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null)

  const categories = ['All', ...Array.from(new Set(helpTopics.map(topic => topic.category)))]

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = searchTerm === '' || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getContextualHelp = () => {
    switch (currentStep) {
      case 'connect':
        return helpTopics.find(t => t.id === 'cloud-providers')
      case 'query':
        return helpTopics.find(t => t.id === 'natural-language')
      case 'preview':
        return helpTopics.find(t => t.id === 'sql-editing')
      case 'results':
        return helpTopics.find(t => t.id === 'results-features')
      default:
        return helpTopics.find(t => t.id === 'getting-started')
    }
  }

  const contextualTopic = getContextualHelp()

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Contextual Help Tooltip */}
        {contextualTopic && (
          <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs shadow-lg animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{contextualTopic.title}</p>
                <p className="text-xs text-blue-700 mt-1">Click help for more details</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Help Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105"
          title="Help & Documentation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
      
      {/* Help Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Help & Documentation</h2>
              <p className="text-sm text-gray-600 mt-1">Get help with DataVibe features</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {selectedTopic ? (
              /* Topic Detail View */
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center mb-3"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to topics
                  </button>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTopic.title}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {selectedTopic.category}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: selectedTopic.content
                        .replace(/^# (.+$)/gm, '<h1 class="text-lg font-semibold text-gray-900 mb-3">$1</h1>')
                        .replace(/^## (.+$)/gm, '<h2 class="text-base font-semibold text-gray-900 mb-2 mt-6">$1</h2>')
                        .replace(/^### (.+$)/gm, '<h3 class="text-sm font-semibold text-gray-900 mb-2 mt-4">$1</h3>')
                        .replace(/^\- (.+$)/gm, '<li class="text-sm text-gray-700 mb-1">$1</li>')
                        .replace(/^([^#\-\n]+)$/gm, '<p class="text-sm text-gray-700 mb-3">$1</p>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
                        .replace(/❌/g, '<span class="text-red-600">❌</span>')
                        .replace(/✅/g, '<span class="text-green-600">✅</span>')
                    }} 
                  />
                  </div>
                </div>
              </div>
            ) : (
              /* Topics List View */
              <div className="h-full overflow-y-auto">
                {contextualTopic && (
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Contextual Help</h4>
                        <p className="text-sm text-blue-800">{contextualTopic.title}</p>
                        <button
                          onClick={() => setSelectedTopic(contextualTopic)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Read more →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="space-y-3">
                    {filteredTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="w-full text-left p-4 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{topic.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{topic.category}</p>
                            <div className="flex flex-wrap gap-1">
                              {topic.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>

                  {filteredTopics.length === 0 && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No help topics found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}