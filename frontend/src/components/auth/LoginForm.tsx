'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
  onSwitchToReset?: () => void
}

export default function LoginForm({ onSuccess, onSwitchToSignUp, onSwitchToReset }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-primary hover:shadow-colored"
        size="lg"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <div className="text-center space-y-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onSwitchToReset}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Forgot your password?
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToSignUp}
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
          >
            Create account
          </Button>
        </div>
      </div>
    </form>
  )
}