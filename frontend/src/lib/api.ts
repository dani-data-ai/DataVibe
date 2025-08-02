interface APIConfig {
  baseURL: string
  timeout: number
}

class APIClient {
  private config: APIConfig
  
  constructor() {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 30000
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('supabase_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        detail: `HTTP ${response.status}: ${response.statusText}` 
      }))
      throw new Error(error.detail || 'Request failed')
    }
    return response.json()
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      ...(data && { body: JSON.stringify(data) })
    })
    return this.handleResponse(response)
  }

  async put(endpoint: string, data?: any) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      ...(data && { body: JSON.stringify(data) })
    })
    return this.handleResponse(response)
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }
}

export const api = new APIClient()

// API endpoints
export const endpoints = {
  auth: {
    status: '/auth/status',
    me: '/auth/me',
    testProtected: '/auth/test-protected',
    validateToken: '/auth/validate-token'
  },
  sessions: {
    create: '/sessions/create',
    list: '/sessions/list',
    destroy: (sessionId: string) => `/sessions/${sessionId}`
  },
  query: {
    preview: '/query/preview',
    execute: '/query/execute',
    providersInfo: '/query/providers-info'
  },
  database: {
    testConnection: '/database/test-connection',
    executeQuery: '/database/execute-query',
    schema: '/database/schema'
  }
}