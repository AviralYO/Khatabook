"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/logo"
import { getSupabaseClient } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("❌ No authenticated user found")
        router.push("/auth/login")
        return
      }

      console.log("✅ Authenticated user ID:", user.id)

      // Verify that the store owner exists
      const { data: storeOwner, error: storeOwnerError } = await supabase
        .from("store_owners")
        .select("id")
        .eq("id", user.id)
        .single()

      if (storeOwnerError || !storeOwner) {
        console.error("❌ Store owner not found:", storeOwnerError)
        toast({
          title: "Error",
          description: "Your store profile is not properly set up. Please contact support.",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Store owner verified:", storeOwner.id)

      const { error } = await supabase.from("customers").insert({
        store_owner_id: user.id,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        total_balance: 0,
      })

      if (error) {
        console.error("❌ Failed to insert customer:", error)
        throw error
      }

      console.log("✅ Customer added successfully")

      toast({
        title: "Success!",
        description: "Customer added successfully.",
      })

      router.push("/dashboard/customers")
    } catch (error: any) {
      console.error("💥 Add customer failed:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Logo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>Add a new customer to your store records</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding Customer..." : "Add Customer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
