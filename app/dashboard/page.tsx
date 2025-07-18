"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { getSupabaseClient } from "@/lib/supabase"
import { Users, TrendingUp, IndianRupee, Plus, LogOut } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalCustomers: number
  totalCredit: number
  totalDebit: number
  netBalance: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

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
          totalCredit += Number.parseFloat(transaction.amount)
        } else {
          totalDebit += Number.parseFloat(transaction.amount)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-blue-600">{storeInfo?.store_name}</p>
              <p className="text-sm text-muted-foreground">{storeInfo?.owner_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {storeInfo?.owner_name}!</h1>
          <p className="text-muted-foreground">{"Here's what's happening with your store today"}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credit Given</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{stats.totalCredit.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{stats.totalDebit.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Outstanding</CardTitle>
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-red-600" : "text-green-600"}`}>
                ₹{Math.abs(stats.netBalance).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.netBalance >= 0 ? "Amount to collect" : "Excess payments"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Add new customers and manage existing ones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/customers">
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View All Customers
                </Button>
              </Link>
              <Link href="/dashboard/customers/add">
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Quick access to recent transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/transactions">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View All Transactions
                </Button>
              </Link>
              <Link href="/dashboard/transactions/add">
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Transaction
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
