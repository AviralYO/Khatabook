"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { Logo } from "@/components/logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (data.session?.user) {
          // Check if user profile exists in store_owners table
          const { data: storeOwner, error: profileError } = await supabase
            .from("store_owners")
            .select("*")
            .eq("id", data.session.user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            // PGRST116 is "not found" error, which is expected for new users
            throw profileError
          }

          if (!storeOwner) {
            // User confirmed email but profile not created yet
            // Redirect to a profile completion page or handle accordingly
            console.log("User confirmed but no profile found")
            setError("Please complete your registration by signing up again.")
            setLoading(false)
            return
          }

          setSuccess(true)
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          throw new Error("No session found")
        }
      } catch (err: any) {
        console.error("Auth callback error:", err)
        setError(err.message || "Failed to confirm email")
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Logo className="justify-center mb-4" />
            <CardTitle className="text-2xl">Confirming your email...</CardTitle>
            <CardDescription>Please wait while we verify your account</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Logo className="justify-center mb-4" />
            <CardTitle className="text-2xl text-green-600">Email Confirmed!</CardTitle>
            <CardDescription>Your account has been successfully verified</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Redirecting you to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-4" />
          <CardTitle className="text-2xl text-red-600">Confirmation Failed</CardTitle>
          <CardDescription>There was an issue confirming your email</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="space-y-2">
            <Link href="/auth/signup">
              <Button className="w-full">Try Signing Up Again</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
