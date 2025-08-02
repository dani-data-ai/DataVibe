import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from '@/components/auth/AuthModal'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the auth forms
jest.mock('@/components/auth/LoginForm', () => {
  return function MockLoginForm({ onSuccess, onSwitchToSignUp, onSwitchToReset }: any) {
    return (
      <div data-testid="login-form">
        <button onClick={onSuccess} data-testid="login-success">Login Success</button>
        <button onClick={onSwitchToSignUp} data-testid="switch-signup">Switch to Sign Up</button>
        <button onClick={onSwitchToReset} data-testid="switch-reset">Switch to Reset</button>
      </div>
    )
  }
})

jest.mock('@/components/auth/SignUpForm', () => {
  return function MockSignUpForm({ onSuccess, onSwitchToLogin }: any) {
    return (
      <div data-testid="signup-form">
        <button onClick={onSuccess} data-testid="signup-success">Sign Up Success</button>
        <button onClick={onSwitchToLogin} data-testid="switch-login">Switch to Login</button>
      </div>
    )
  }
})

jest.mock('@/components/auth/PasswordResetForm', () => {
  return function MockPasswordResetForm({ onSuccess, onBack }: any) {
    return (
      <div data-testid="reset-form">
        <button onClick={onSuccess} data-testid="reset-success">Reset Success</button>
        <button onClick={onBack} data-testid="reset-back">Back to Login</button>
      </div>
    )
  }
})

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn()
    }
  }))
}))

describe('AuthModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
  })

  it('does not render when isOpen is false', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={false} onClose={mockOnClose} />
      </AuthProvider>
    )

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })

  it('renders login form by default when open', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('reset-form')).not.toBeInTheDocument()
  })

  it('renders signup form when initialMode is signup', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} initialMode="signup" />
      </AuthProvider>
    )

    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('reset-form')).not.toBeInTheDocument()
  })

  it('renders reset form when initialMode is reset', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} initialMode="reset" />
      </AuthProvider>
    )

    expect(screen.getByText('Reset Password')).toBeInTheDocument()
    expect(screen.getByTestId('reset-form')).toBeInTheDocument()
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument()
  })

  it('switches between forms correctly', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    // Start with login form
    expect(screen.getByTestId('login-form')).toBeInTheDocument()

    // Switch to signup
    await user.click(screen.getByTestId('switch-signup'))
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByTestId('signup-form')).toBeInTheDocument()
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    })

    // Switch back to login
    await user.click(screen.getByTestId('switch-login'))
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument()
    })

    // Switch to reset
    await user.click(screen.getByTestId('switch-reset'))
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument()
      expect(screen.getByTestId('reset-form')).toBeInTheDocument()
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
    })

    // Back to login from reset
    await user.click(screen.getByTestId('reset-back'))
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByTestId('login-form')).toBeInTheDocument()
      expect(screen.queryByTestId('reset-form')).not.toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when form success is triggered', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    // Trigger login success
    await user.click(screen.getByTestId('login-success'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('displays Supabase branding', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    expect(screen.getByText(/Secure authentication powered by Supabase/)).toBeInTheDocument()
  })

  it('has proper modal styling and overlay', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    // Check for modal overlay
    const overlay = screen.getByTestId('login-form').closest('.fixed')
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50')

    // Check for modal content
    const modal = screen.getByText('Sign In').closest('.bg-white')
    expect(modal).toHaveClass('bg-white', 'rounded-lg', 'p-8')
  })

  it('handles successful signup', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} initialMode="signup" />
      </AuthProvider>
    )

    // Trigger signup success
    await user.click(screen.getByTestId('signup-success'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles successful password reset', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} initialMode="reset" />
      </AuthProvider>
    )

    // Trigger reset success
    await user.click(screen.getByTestId('reset-success'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('maintains form state when switching modes', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    // Switch to signup and back to login
    await user.click(screen.getByTestId('switch-signup'))
    await user.click(screen.getByTestId('switch-login'))

    // Should be back to login form
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders with correct z-index for modal layering', () => {
    render(
      <AuthProvider>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </AuthProvider>
    )

    const overlay = screen.getByTestId('login-form').closest('.fixed')
    expect(overlay).toHaveClass('z-50')
  })
})