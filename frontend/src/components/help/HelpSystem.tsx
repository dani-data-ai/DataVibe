'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  HelpCircle, 
  Search, 
  ArrowLeft, 
  ChevronRight,
  X,
  Database,
  MessageSquare,
  FileCheck,
  BarChart3,
  Shield,
  AlertTriangle,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HelpTopic {
  id: string
  title: string
  category: string
  content: string
  tags: string[]
  icon: React.ComponentType<{ className?: string }>
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
    icon: HelpCircle,
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
    icon: Database,
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
    icon: MessageSquare,
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
    icon: FileCheck,
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
    icon: BarChart3,
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
    icon: Shield,
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
    icon: AlertTriangle,
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
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        {/* Contextual Help Tooltip */}
        <AnimatePresence>
          {contextualTopic && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-3 max-w-xs"
            >
              <Card className="bg-blue-50 border-blue-200 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    <div className="p-1 bg-blue-100 rounded-md">
                      <contextualTopic.icon className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {contextualTopic.title}
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Click help for more details
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Help Button */}
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90"
          title="Help & Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className={cn("fixed inset-0 z-50", className)}>
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
        
        {/* Help Panel */}
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 w-full max-w-2xl"
        >
          <Card className="h-full rounded-none border-l shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      Help & Documentation
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Get help with DataVibe features and workflows
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Search and Filters */}
              <div className="p-6 border-b bg-gray-50/50">
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search help topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="h-7 text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {selectedTopic ? (
              /* Topic Detail View */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="p-6 border-b bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                    className="mb-4 -ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to topics
                  </Button>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <selectedTopic.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedTopic.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedTopic.category}</Badge>
                        <div className="flex gap-1">
                          {selectedTopic.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-strong:text-gray-900">
                      <div dangerouslySetInnerHTML={{ 
                        __html: selectedTopic.content
                          .replace(/^# (.+$)/gm, '<h1 class="text-lg font-semibold text-gray-900 mb-4 mt-0">$1</h1>')
                          .replace(/^## (.+$)/gm, '<h2 class="text-base font-semibold text-gray-900 mb-3 mt-6">$1</h2>')
                          .replace(/^### (.+$)/gm, '<h3 class="text-sm font-semibold text-gray-900 mb-2 mt-4">$1</h3>')
                          .replace(/^- (.+$)/gm, '<li class="text-sm text-gray-700 mb-1 ml-4">$1</li>')
                          .replace(/^([^#\-\n]+)$/gm, '<p class="text-sm text-gray-700 mb-3">$1</p>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                          .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">$1</code>')
                          .replace(/❌/g, '<span class="text-red-600 font-medium">❌</span>')
                          .replace(/✅/g, '<span class="text-green-600 font-medium">✅</span>')
                      }} 
                      />
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            ) : (
              /* Topics List View */
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-y-auto"
              >
                {contextualTopic && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <Card className="bg-white/60 backdrop-blur-sm border-blue-200/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <contextualTopic.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">
                              Contextual Help
                            </h4>
                            <p className="text-sm text-blue-800 mb-3">
                              {contextualTopic.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTopic(contextualTopic)}
                              className="h-auto p-0 text-blue-600 hover:text-blue-800"
                            >
                              Read more
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="p-6">
                  <div className="grid gap-3">
                    {filteredTopics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
                              onClick={() => setSelectedTopic(topic)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-gray-50 group-hover:bg-blue-50 rounded-lg transition-colors">
                                  <topic.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">
                                    {topic.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {topic.category}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {topic.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {filteredTopics.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No help topics found</h3>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search or category filter
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}