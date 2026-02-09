'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { Loader } from '@/components/ui/Loader'

interface LoginDialogProps {
  isLoading?: boolean
}

export default function LoginDialog({ isLoading: isCheckingAuth }: LoginDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background-01-color)]">
        <Loader />
      </div>
    )
  }

  return (
    <Dialog open={true}>
      <DialogContent className="!min-w-[400px] !max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sign in to Dashboard</DialogTitle>
          <DialogDescription>
            Enter your credentials to access the analytics dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <label htmlFor="dashboard-username">
              <Text variant="captionsemibold" color="default">
                Username
              </Text>
            </label>
            <Input
              id="dashboard-username"
              name="dashboard-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dashboard-password">
              <Text variant="captionsemibold" color="default">
                Password
              </Text>
            </label>
            <Input
              id="dashboard-password"
              name="dashboard-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <Text variant="body" className="text-[var(--error-color)]">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            disabled={!username || !password}
          >
            Sign in
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
