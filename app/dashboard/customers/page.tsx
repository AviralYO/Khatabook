"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { getSupabaseClient } from "@/lib/supabase"
import { ArrowLeft, Plus, Search, Phone, MapPin } from "lucide-react"

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  total_balance: number
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkUserAndLoadCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.phone?.includes(searchTerm),
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const checkUserAndLoadCustomers = async () => {
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
        .order("created_at", { ascending: false })

      if (error) throw error

      setCustomers(customersData || [])
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Logo />
          </div>
          <Link href="/dashboard/customers/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
          <p className="text-muted-foreground">Manage all your customers and their credit records</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {customers.length === 0 ? "No customers added yet" : "No customers found"}
              </p>
              <Link href="/dashboard/customers/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Customer
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{customer.name}</h3>
                        <Badge
                          variant={
                            customer.total_balance > 0
                              ? "destructive"
                              : customer.total_balance < 0
                                ? "default"
                                : "secondary"
                          }
                        >
                          {customer.total_balance > 0
                            ? `Owes ₹${customer.total_balance.toFixed(2)}`
                            : customer.total_balance < 0
                              ? `Advance ₹${Math.abs(customer.total_balance).toFixed(2)}`
                              : "Settled"}
                        </Badge>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {customer.address}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/dashboard/transactions/add?customer=${customer.id}`}>
                        <Button size="sm">Add Transaction</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
