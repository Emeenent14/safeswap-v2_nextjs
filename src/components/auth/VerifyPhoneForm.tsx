'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { 
  Phone, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface VerifyPhoneFormProps {
  token?: string
}

export default function VerifyPhoneForm({ token }: VerifyPhoneFormProps) {
  const router = useRouter()
  const { user, verifyPhone, resendVerification, error, clearError } = useAuth()
  const [verificationCode, setVerificationCode] = useState(token || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Auto-verify if token is provided via URL
  useEffect(() => {
    if (token && !isVerified) {
      handleVerify(token)
    }
  }, [token])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async (code: string = verificationCode) => {
    if (!code.trim()) return

    try {
      setIsVerifying(true)
      clearError()
      await verifyPhone(code)
      setIsVerified(true)
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Phone verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      setIsResending(true)
      clearError()
      await resendVerification('phone')
      setResendCooldown(60) // 60 second cooldown
    } catch (error) {
      console.error('Resend verification failed:', error)
    } finally {
      setIsResending(false)
    }
  }

  // Mask phone number for display
  const getMaskedPhone = (phone: string) => {
    if (!phone || phone.length < 4) return phone
    const last4 = phone.slice(-4)
    const masked = phone.slice(0, -4).replace(/\d/g, '*')
    return masked + last4
  }

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl text-green-900 dark:text-green-100">
            Phone Verified!
          </CardTitle>
          <CardDescription>
            Your phone number has been successfully verified. You&apos;ll be redirected to your dashboard shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl">
          Verify Your Phone
        </CardTitle>
        <CardDescription>
          {user?.phone ? (
            <>
              We sent a verification code to <strong>{getMaskedPhone(user.phone)}</strong>. 
              Please enter it below to verify your phone number.
            </>
          ) : (
            'Please enter the verification code sent to your phone number.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Code Input */}
        <div className="space-y-2">
          <Label htmlFor="verificationCode" className="text-sm font-medium">
            Verification Code
          </Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-wider font-mono"
            maxLength={6}
            aria-describedby="code-help"
          />
          <p id="code-help" className="text-xs text-gray-500 text-center">
            Enter the 6-digit code from your SMS
          </p>
        </div>

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify()}
          disabled={verificationCode.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Phone'
          )}
        </Button>

        {/* Resend Section */}
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Didn&apos;t receive the code?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The verification code expires in 10 minutes. 
            Standard SMS rates may apply.
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="text-sm"
          >
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}