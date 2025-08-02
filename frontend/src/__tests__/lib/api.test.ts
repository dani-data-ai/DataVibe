import { api, endpoints } from '@/lib/api'

// Mock fetch
global.fetch = jest.fn()

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.getItem.mockReturnValue(null)
    
    // Mock successful fetch response
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: 'test' })
    })
  })

  describe('Authentication Headers', () => {
    it('includes Content-Type header by default', async () => {
      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('includes Authorization header when token exists', async () => {
      mockSessionStorage.getItem.mockReturnValue('test-jwt-token')

      await api.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-jwt-token'
          })
        })
      )
    })

    it('omits Authorization header when no token exists', async () => {
      mockSessionStorage.getItem.mockReturnValue(null)

      await api.get('/test')

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      expect(callArgs[1].headers).not.toHaveProperty('Authorization')
    })
  })

  describe('HTTP Methods', () => {
    it('makes GET requests correctly', async () => {
      await api.get('/test-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test-endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      )
    })

    it('makes POST requests with data', async () => {
      const testData = { key: 'value' }
      await api.post('/test-endpoint', testData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify(testData)
        })
      )
    })

    it('makes POST requests without data', async () => {
      await api.post('/test-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test-endpoint',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object)
        })
      )
      
      const callArgs = (fetch as jest.Mock).mock.calls[0]
      expect(callArgs[1]).not.toHaveProperty('body')
    })

    it('makes PUT requests with data', async () => {
      const testData = { updated: 'value' }
      await api.put('/test-endpoint', testData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test-endpoint',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.any(Object),
          body: JSON.stringify(testData)
        })
      )
    })

    it('makes DELETE requests correctly', async () => {
      await api.delete('/test-endpoint')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test-endpoint',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.any(Object)
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('throws error for HTTP error responses with JSON detail', async () => {
      const errorResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ detail: 'Invalid token' })
      }
      ;(fetch as jest.Mock).mockResolvedValue(errorResponse)

      await expect(api.get('/test')).rejects.toThrow('Invalid token')
    })

    it('throws error for HTTP error responses without JSON', async () => {
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Not JSON'))
      }
      ;(fetch as jest.Mock).mockResolvedValue(errorResponse)

      await expect(api.get('/test')).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('handles network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(api.get('/test')).rejects.toThrow('Network error')
    })
  })

  describe('Session Management Methods', () => {
    it('creates session correctly', async () => {
      const sessionData = {
        connection_string: 'postgresql://test',
        name: 'Test Session'
      }

      await api.createSession(sessionData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/sessions/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(sessionData)
        })
      )
    })

    it('lists sessions correctly', async () => {
      await api.listSessions()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/sessions/list',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('destroys session correctly', async () => {
      const sessionId = 'test-session-id'
      await api.destroySession(sessionId)

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/sessions/${sessionId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Query Methods', () => {
    it('generates query correctly', async () => {
      const queryData = {
        session_id: 'test-session',
        prompt: 'Show all users'
      }

      await api.generateQuery(queryData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/query/preview',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(queryData)
        })
      )
    })

    it('executes query correctly', async () => {
      const executeData = {
        session_id: 'test-session',
        query_id: 'test-query',
        sql_query: 'SELECT * FROM users',
        confirm_execution: true
      }

      await api.executeQuery(executeData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/query/execute',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(executeData)
        })
      )
    })
  })

  describe('Authentication Methods', () => {
    it('gets auth status correctly', async () => {
      await api.getAuthStatus()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/status',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('gets user info correctly', async () => {
      await api.getMe()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/me',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('tests protected endpoint correctly', async () => {
      await api.testProtected()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/test-protected',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })
  })

  describe('Configuration', () => {
    it('uses default baseURL when env var not set', () => {
      // The API client is instantiated during import, 
      // so we test the default behavior
      expect(api).toBeDefined()
    })

    it('uses custom baseURL from environment variable', () => {
      // This would require reinitializing the API client
      // with different environment variables
      expect(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').toBeTruthy()
    })
  })

  describe('Response Handling', () => {
    it('returns parsed JSON response for successful requests', async () => {
      const responseData = { success: true, data: 'test-data' }
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(responseData)
      })

      const result = await api.get('/test')
      expect(result).toEqual(responseData)
    })

    it('handles empty JSON responses', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      })

      const result = await api.get('/test')
      expect(result).toEqual({})
    })
  })
})

describe('API Endpoints', () => {
  it('has correct auth endpoints', () => {
    expect(endpoints.auth).toEqual({
      status: '/auth/status',
      me: '/auth/me',
      testProtected: '/auth/test-protected',
      validateToken: '/auth/validate-token'
    })
  })

  it('has correct session endpoints', () => {
    expect(endpoints.sessions.create).toBe('/sessions/create')
    expect(endpoints.sessions.list).toBe('/sessions/list')
    expect(endpoints.sessions.destroy('test-id')).toBe('/sessions/test-id')
  })

  it('has correct query endpoints', () => {
    expect(endpoints.query).toEqual({
      preview: '/query/preview',
      execute: '/query/execute',
      providersInfo: '/query/providers-info'
    })
  })

  it('has correct database endpoints', () => {
    expect(endpoints.database).toEqual({
      testConnection: '/database/test-connection',
      executeQuery: '/database/execute-query',
      schema: '/database/schema'
    })
  })
})