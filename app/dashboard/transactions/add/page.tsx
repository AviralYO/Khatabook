"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/logo"
import { getSupabaseClient } from "@/lib/supabase"
import { ArrowLeft, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Customer {
  id: string
  name: string
  phone: string
  total_balance: number
}

export default function AddTransactionPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    customerId: "",
    type: "credit" as "credit" | "debit",
    amount: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    loadCustomers()

    // Pre-select customer if coming from customer page
    const preSelectedCustomer = searchParams.get("customer")
    if (preSelectedCustomer) {
      setFormData((prev) => ({ ...prev, customerId: preSelectedCustomer }))
    }
  }, [searchParams])

  const loadCustomers = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: customersData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("store_owner_id", user.id)
        .order("name")

      if (error) throw error

      setCustomers(customersData || [])
    } catch (error) {
      console.error("Error loading customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const amount = Number(formData.amount)

      // Insert transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        customer_id: formData.customerId,
        store_owner_id: user.id,
        type: formData.type,
        amount: amount,
        description: formData.description,
        transaction_date: new Date().toISOString(),
      })

      if (transactionError) throw transactionError

      // Update customer balance
      const selectedCustomer = customers.find((c) => c.id === formData.customerId)
      if (selectedCustomer) {
        const balanceChange = formData.type === "credit" ? amount : -amount
        const newBalance = selectedCustomer.total_balance + balanceChange

        const { error: balanceError } = await supabase
          .from("customers")
          .update({ total_balance: newBalance })
          .eq("id", formData.customerId)

        if (balanceError) throw balanceError
      }

      toast({
        title: "Success!",
        description: `Transaction recorded successfully.`,
      })

      router.push("/dashboard/transactions")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingCustomers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard/transactions">
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
              <CardTitle>Add New Transaction</CardTitle>
              <CardDescription>Record a credit or payment transaction</CardDescription>
            </CardHeader>
            <CardContent>
              {customers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No customers found. Add a customer first.</p>
                  <Link href="/dashboard/customers/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Customer
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{customer.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {customer.total_balance > 0
                                  ? `Owes ₹${customer.total_balance.toFixed(2)}`
                                  : customer.total_balance < 0
                                    ? `Advance ₹${Math.abs(customer.total_balance).toFixed(2)}`
                                    : "Settled"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Transaction Type *</Label>
                    <RadioGroup
                      value={formData.type}
                      onValueChange={(value: "credit" | "debit") => setFormData((prev) => ({ ...prev, type: value }))}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="credit" id="credit" />
                        <Label htmlFor="credit" className="flex-1 cursor-pointer">
                          <div className="font-medium text-red-600">Credit Given</div>
                          <div className="text-sm text-muted-foreground">Customer owes you money</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="debit" id="debit" />
                        <Label htmlFor="debit" className="flex-1 cursor-pointer">
                          <div className="font-medium text-green-600">Payment Received</div>
                          <div className="text-sm text-muted-foreground">Customer paid you money</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional: Add details about this transaction"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Recording Transaction..." : "Record Transaction"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
