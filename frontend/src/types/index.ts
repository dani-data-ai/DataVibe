export interface DatabaseConnection {
  id: string
  name: string
  type: 'postgresql' | 'mysql'
  host: string
  port: number
  database: string
  username: string
  isConnected: boolean
  environment: 'development' | 'production'
}

export interface QueryResult {
  data: any[]
  columns: string[]
  rowCount: number
  executionTime: number
  explanation?: string
  sqlQuery: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'developer' | 'viewer'
  permissions: string[]
}

export interface SchemaChangeProposal {
  id: string
  title: string
  description: string
  sqlMigration: string
  status: 'pending' | 'approved' | 'rejected'
  createdBy: string
  createdAt: Date
  reviewedBy?: string
  reviewedAt?: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: 'query' | 'schema_change' | 'connection'
  details: string
  timestamp: Date
  success: boolean
}