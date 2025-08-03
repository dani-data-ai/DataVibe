'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Database, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  ArrowRight,
  Loader2,
  Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SchemaProposalProps {
  sessionId: string
  onProposalCreated?: (proposal: any) => void
}

interface ProposalResult {
  success: boolean
  proposal_id?: string
  migration_sql?: string
  explanation?: string
  warnings?: string[]
  environment?: string
  status?: string
  requires_approval?: boolean
  message?: string
}

export default function SchemaProposal({ sessionId, onProposalCreated }: SchemaProposalProps) {
  const [naturalLanguage, setNaturalLanguage] = useState('')
  const [environment, setEnvironment] = useState<'development' | 'production'>('development')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ProposalResult | null>(null)
  const [error, setError] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)

  const schemaTemplates = [
    {
      category: 'Table Operations',
      templates: [
        { name: 'Add new table', query: 'Create a new table called [table_name] with columns [column_definitions]' },
        { name: 'Add column', query: 'Add a new column [column_name] of type [data_type] to table [table_name]' },
        { name: 'Modify column', query: 'Change column [column_name] in table [table_name] to [new_definition]' },
        { name: 'Drop column', query: 'Remove column [column_name] from table [table_name]' }
      ]
    },
    {
      category: 'Indexes & Constraints',
      templates: [
        { name: 'Add index', query: 'Create an index on column [column_name] in table [table_name]' },
        { name: 'Add foreign key', query: 'Add foreign key constraint from [table1].[column1] to [table2].[column2]' },
        { name: 'Add unique constraint', query: 'Make column [column_name] unique in table [table_name]' },
        { name: 'Add check constraint', query: 'Add check constraint to ensure [condition] in table [table_name]' }
      ]
    },
    {
      category: 'Views & Functions',
      templates: [
        { name: 'Create view', query: 'Create a view called [view_name] that shows [description]' },
        { name: 'Create trigger', query: 'Create a trigger on table [table_name] that [action] when [event]' },
        { name: 'Create function', query: 'Create a function called [function_name] that [description]' }
      ]
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!naturalLanguage.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await api.post('/schema/propose', {
        natural_language: naturalLanguage,
        session_id: sessionId,
        environment
      })

      setResult(response)
      
      if (response.success && onProposalCreated) {
        onProposalCreated(response)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create schema proposal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: string) => {
    setNaturalLanguage(template)
    setShowTemplates(false)
  }

  const resetForm = () => {
    setNaturalLanguage('')
    setResult(null)
    setError('')
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Schema Modification Proposal</CardTitle>
              <CardDescription>
                Describe the schema changes you need in natural language
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Target Environment</label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={environment === 'development' ? 'default' : 'outline'}
                onClick={() => setEnvironment('development')}
                className="flex-1 gap-2"
              >
                <FileText className="w-4 h-4" />
                Development
              </Button>
              <Button
                type="button"
                variant={environment === 'production' ? 'default' : 'outline'}
                onClick={() => setEnvironment('production')}
                className="flex-1 gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Production
              </Button>
            </div>
            {environment === 'production' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <strong>Production changes require admin approval</strong> and will be queued for review before execution.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Schema Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Schema Change Description</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Templates
                </Button>
              </div>
              
              <div className="relative">
                <Input
                  value={naturalLanguage}
                  onChange={(e) => setNaturalLanguage(e.target.value)}
                  placeholder="e.g., Add a new column 'email' to the users table"
                  className="min-h-[120px] resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!naturalLanguage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Create Proposal
              </Button>
              
              {(result || error) && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Create Another
                </Button>
              )}
            </div>
          </form>

          {/* Templates Dropdown */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm"
              >
                <div className="p-4 space-y-4">
                  <h4 className="font-medium text-sm">Schema Change Templates</h4>
                  {schemaTemplates.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {category.category}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {category.templates.map((template) => (
                          <button
                            key={template.name}
                            type="button"
                            onClick={() => handleTemplateSelect(template.query)}
                            className="text-left p-3 rounded-lg bg-white/50 hover:bg-white/80 border border-white/20 hover:border-white/40 transition-all text-sm"
                          >
                            <div className="font-medium text-foreground">{template.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{template.query}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`glass-effect ${result.success ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${result.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.success ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {result.success ? 'Proposal Created Successfully' : 'Proposal Failed'}
                    </CardTitle>
                    <CardDescription>
                      {result.message || (result.success ? 'Your schema change proposal has been generated' : 'Failed to create proposal')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              {result.success && (
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">ID: {result.proposal_id}</Badge>
                    <Badge variant={environment === 'production' ? 'destructive' : 'default'}>
                      {result.environment?.toUpperCase()}
                    </Badge>
                    <Badge variant={result.requires_approval ? 'secondary' : 'success'}>
                      {result.requires_approval ? 'Requires Approval' : 'Auto-Approved'}
                    </Badge>
                  </div>

                  {result.explanation && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Explanation</h4>
                      <p className="text-sm text-muted-foreground">{result.explanation}</p>
                    </div>
                  )}

                  {result.migration_sql && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Generated Migration SQL</h4>
                      <pre className="p-3 rounded-lg bg-gray-50 text-sm overflow-x-auto">
                        {result.migration_sql}
                      </pre>
                    </div>
                  )}

                  {result.warnings && result.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-600">Warnings</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-amber-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}