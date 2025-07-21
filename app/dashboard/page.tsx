"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { Users, TrendingUp, IndianRupee, Plus } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalCustomers: number
  totalCredit: number
  totalDebit: number
  netBalance: number
}

export default function DashboardPage() {
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Get store info
        const { data: storeData } = await supabase.from("store_owners").select("*").eq("id", user.id).single()

        setStoreInfo(storeData)

        // Get dashboard stats
        await loadStats(user.id)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    checkUserAndLoadData()
  }, [router, supabase])

  const loadStats = async (userId: string) => {
    try {
      // Get total customers
      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("store_owner_id", userId)

      // Get transaction stats
      const { data: transactions } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("store_owner_id", userId)

      let totalCredit = 0
      let totalDebit = 0

      transactions?.forEach((transaction) => {
        if (transaction.type === "credit") {
          totalCredit += parseFloat(transaction.amount)
        } else {
          totalDebit += parseFloat(transaction.amount)
        }
      })

      setStats({
        totalCustomers: customerCount || 0,
        totalCredit,
        totalDebit,
        netBalance: totalCredit - totalDebit,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {storeInfo?.owner_name}!</h1>
          <p className="text-muted-foreground">{"Here's what's happening with your store today"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Given</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCredit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalDebit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.netBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Add New Customer</h3>
                  <p className="text-sm text-muted-foreground">Add a new customer to your records</p>
                </div>
                <Link href="/dashboard/customers/add">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
