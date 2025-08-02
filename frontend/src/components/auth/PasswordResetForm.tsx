'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

interface PasswordResetFormProps {
  onSuccess?: () => void
  onBack?: () => void
}

export default function PasswordResetForm({ onSuccess, onBack }: PasswordResetFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Password reset email sent! Check your inbox.')
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {message && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Reset Your Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="pl-11"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-colored"
          size="lg"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Button>
      </div>
    </div>
  )
}