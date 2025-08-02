import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}))

// Mock environment variables
const mockSupabaseUrl = 'https://test.supabase.co'
const mockSupabaseKey = 'test-anon-key'

const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn()
  }
}

// Test component to access AuthContext
const TestComponent = () => {
  const { user, session, loading, signUp, signIn, signOut, resetPassword } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <div data-testid="session">{session ? 'has session' : 'no session'}</div>
      <button onClick={() => signUp('test@example.com', 'password')} data-testid="signup">
        Sign Up
      </button>
      <button onClick={() => signIn('test@example.com', 'password')} data-testid="signin">
        Sign In
      </button>
      <button onClick={() => signOut()} data-testid="signout">
        Sign Out
      </button>
      <button onClick={() => resetPassword('test@example.com')} data-testid="reset">
        Reset Password
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockSupabaseUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockSupabaseKey
    
    // Setup Supabase mock
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    
    // Default session state
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })
    
    // Default auth state change handler
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    })
    
    // Clear sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    })
  })

  it('initializes with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    expect(screen.getByTestId('user')).toHaveTextContent('no user')
    expect(screen.getByTestId('session')).toHaveTextContent('no session')
  })

  it('handles successful sign up', async () => {
    const user = { id: 'user-id', email: 'test@example.com' }
    const session = { access_token: 'token', user }
    
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user, session },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signUpButton = screen.getByTestId('signup')
    await act(async () => {
      await userEvent.click(signUpButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('handles sign up error', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already registered' }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signUpButton = screen.getByTestId('signup')
    await act(async () => {
      await userEvent.click(signUpButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled()
    })
  })

  it('handles successful sign in', async () => {
    const user = { id: 'user-id', email: 'test@example.com' }
    const session = { access_token: 'token', user }
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user, session },
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signInButton = screen.getByTestId('signin')
    await act(async () => {
      await userEvent.click(signInButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('handles sign in error', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signInButton = screen.getByTestId('signin')
    await act(async () => {
      await userEvent.click(signInButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled()
    })
  })

  it('handles sign out', async () => {
    // Start with authenticated state
    const user = { id: 'user-id', email: 'test@example.com' }
    const session = { access_token: 'token', user }
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session },
      error: null
    })
    
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signOutButton = screen.getByTestId('signout')
    await act(async () => {
      await userEvent.click(signOutButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })
  })

  it('handles password reset', async () => {
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const resetButton = screen.getByTestId('reset')
    await act(async () => {
      await userEvent.click(resetButton)
    })

    await waitFor(() => {
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })
  })

  it('stores JWT token in sessionStorage on sign in', async () => {
    const user = { id: 'user-id', email: 'test@example.com' }
    const session = { access_token: 'jwt-token', user }
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user, session },
      error: null
    })

    // Mock auth state change to trigger token storage
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', session)
      }, 0)
      
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    const signInButton = screen.getByTestId('signin')
    await act(async () => {
      await userEvent.click(signInButton)
    })

    // Wait for auth state change to process
    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'supabase_token',
        'jwt-token'
      )
    })
  })

  it('removes JWT token from sessionStorage on sign out', async () => {
    // Mock auth state change to trigger token removal
    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_OUT', null)
      }, 0)
      
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      }
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    // Wait for auth state change to process
    await waitFor(() => {
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('supabase_token')
    })
  })

  it('creates Supabase client with correct configuration', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(createClient).toHaveBeenCalledWith(
      mockSupabaseUrl,
      mockSupabaseKey
    )
  })

  it('handles missing environment variables gracefully', () => {
    // Remove environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Should not throw error
    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    }).not.toThrow()
  })
})