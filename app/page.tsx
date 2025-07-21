"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { getSupabaseClient } from "@/lib/supabase"
import {
  Users,
  TrendingUp,
  IndianRupee,
  Plus,
  LogOut,
  Sun,
  Moon,
  User,
  CreditCard,
  Menu,
  X,
  Languages,
  User as UserIcon
} from "lucide-react"
import { useTheme } from "next-themes"

interface DashboardStats {
  totalCustomers: number
  totalCredit: number
  totalDebit: number
  netBalance: number
}

interface Translations {
  title: string
  slogan: string
  sloganEng: string
  startToday: string
  createAccount: string
  login: string
  welcome: string
  menu: string
  viewCustomers: string
  addCustomer: string
  viewTransactions: string
  addTransaction: string
  netOutstanding: string
  amountToCollect: string
  excessPayments: string
  lightMode: string
  darkMode: string
  logout: string
  customers: string
  creditGiven: string
  paymentsReceived: string
  footerText: string
  whyChoose: string
  manageCustomers: string
  manageCustomersDesc: string
  trackTransactions: string
  trackTransactionsDesc: string
  secureReliable: string
  secureReliableDesc: string
}

const translations: { [key: string]: Translations } = {
  hi: {
    title: "KhataBook",
    slogan: "आपका डिजिटल खाता, आपकी सफलता का साथी",
    sloganEng: "Your Digital Ledger, Your Success Partner",
    startToday: "शुरू करें आज ही",
    createAccount: "नया खाता बनाएं",
    login: "लॉगिन करें",
    welcome: "वापस आपका स्वागत है",
    menu: "मेनू",
    viewCustomers: "ग्राहक देखें",
    addCustomer: "ग्राहक जोड़ें",
    viewTransactions: "लेनदेन देखें",
    addTransaction: "लेनदेन जोड़ें",
    netOutstanding: "कुल बकाया",
    amountToCollect: "वसूली की राशि",
    excessPayments: "अतिरिक्त भुगतान",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    logout: "लॉगआउट",
    customers: "ग्राहक",
    creditGiven: "दिया गया उधार",
    paymentsReceived: "प्राप्त भुगतान",
    footerText: "भारत भर के किराना स्टोर का डिजिटलीकरण",
    whyChoose: "खताबुक क्यों चुनें?",
    manageCustomers: "ग्राहक प्रबंधित करें",
    manageCustomersDesc: "अपने सभी ग्राहकों के विवरण और शेष राशि को एक ही स्थान पर रखें।",
    trackTransactions: "लेन-देन ट्रैक करें",
    trackTransactionsDesc: "हर क्रेडिट और डेबिट लेन-देन को आसानी और सटीकता से रिकॉर्ड करें।",
    secureReliable: "सुरक्षित और विश्वसनीय",
    secureReliableDesc: "आपका डेटा हमारे पास सुरक्षित है, कभी भी, कहीं भी पहुँचा जा सकता है।"
  },
  en: {
    title: "KhataBook",
    slogan: "Your Digital Ledger, Your Success Partner",
    sloganEng: "डिजिटल खाता-किताब, सफलता का साथी",
    startToday: "Get Started Today",
    createAccount: "Create New Account",
    login: "Login",
    welcome: "Welcome back",
    menu: "Menu",
    viewCustomers: "View Customers",
    addCustomer: "Add Customer",
    viewTransactions: "View Transactions",
    addTransaction: "Add Transaction",
    netOutstanding: "Net Outstanding",
    amountToCollect: "Amount to collect",
    excessPayments: "Excess payments",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    logout: "Logout",
    customers: "Customers",
    creditGiven: "Credit Given",
    paymentsReceived: "Payments Received",
    footerText: "Digitizing kirana stores across India",
    whyChoose: "Why Choose KhataBook?",
    manageCustomers: "Manage Customers",
    manageCustomersDesc: "Keep track of all your customer details and balances in one place.",
    trackTransactions: "Track Transactions",
    trackTransactionsDesc: "Record every credit and debit transaction with ease and accuracy.",
    secureReliable: "Secure & Reliable",
    secureReliableDesc: "Your data is safe with us, accessible anytime, anywhere."
  }
}

function CurrencyDisplay({ value, decimals = 2, className = "" }: { value: number, decimals?: number, className?: string }) {
  const formattedValue = `₹${String(Math.abs(value).toFixed(decimals))}`
  return <div className={`text-2xl font-bold ${className}`}>{formattedValue}</div>
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState<'hi' | 'en'>('hi')
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { theme, setTheme } = useTheme()

  const t = translations[language]

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('khatabook-language')
    if (savedLanguage === 'hi' || savedLanguage === 'en') {
      setLanguage(savedLanguage)
    }
    checkUser()
  }, [])

  const toggleLanguage = () => {
    const newLanguage: 'hi' | 'en' = language === 'hi' ? 'en' : 'hi'
    setLanguage(newLanguage)
    localStorage.setItem('khatabook-language', newLanguage)
  }

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        
        // Get store info
        const { data: storeData } = await supabase.from("store_owners").select("*").eq("id", user.id).single()
        setStoreInfo(storeData)
        
        // Get dashboard stats
        await loadStats(user.id)
      }
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
    setUser(null)
    setStoreInfo(null)
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Logo className="justify-center mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    )
  }

  // Sidebar component for homepage
  function HomeSidebar() {
    const [expanded, setExpanded] = useState(false)
    return (
      <aside
        className={`fixed top-4 left-4 z-20 flex flex-col h-[calc(100vh-2rem)] transition-all duration-300
          ${expanded ? 'w-48' : 'w-16'}
          bg-[rgba(30,30,30,0.7)] backdrop-blur-md shadow-xl rounded-3xl
        `}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 mt-6 px-2">
          <Link href="/dashboard/profile">
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
              <UserIcon className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">View Profile</span>}
            </Button>
          </Link>
          <Link href="/dashboard/customers">
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
              <Users className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">{t.viewCustomers}</span>}
            </Button>
          </Link>
          <Link href="/dashboard/customers/add">
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
              <User className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">{t.addCustomer}</span>}
            </Button>
          </Link>
          <Link href="/dashboard/transactions">
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
              <TrendingUp className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">{t.viewTransactions}</span>}
            </Button>
          </Link>
          <Link href="/dashboard/transactions/add">
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
              <CreditCard className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">{t.addTransaction}</span>}
            </Button>
          </Link>
        </nav>
        {/* Outstanding */}
        {user && (
          <div className={`mx-2 my-4 p-4 rounded-xl bg-gradient-to-br from-[#ffecd2] to-[#fcb69f] text-gray-900 shadow transition-all duration-300 ${expanded ? 'block' : 'hidden'}`}>
            <div className="text-xs font-semibold">{t.netOutstanding}</div>
            <CurrencyDisplay value={stats.netBalance} />
            <div className="text-xs">{stats.netBalance >= 0 ? t.amountToCollect : t.excessPayments}</div>
          </div>
        )}
        {/* Settings & Actions */}
        <div className="flex flex-col gap-2 mb-4 px-2 mt-auto">
          <Button onClick={toggleLanguage} variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
            <Languages className="h-5 w-5" />
            {expanded && <span className="whitespace-nowrap">{language === 'hi' ? 'English' : 'हिंदी'}</span>}
          </Button>
          <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} variant="ghost" className="w-full justify-start gap-3 text-white/90 hover:bg-white/10">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {expanded && <span className="whitespace-nowrap">{theme === 'dark' ? t.lightMode : t.darkMode}</span>}
          </Button>
          {user && (
            <Button onClick={handleLogout} variant="destructive" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              {expanded && <span className="whitespace-nowrap">{t.logout}</span>}
            </Button>
          )}
        </div>
      </aside>
    )
  }

  // Authenticated user view
  if (user) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-transparent">
        <HomeSidebar />
        <div className="flex-1 relative flex flex-col overflow-hidden" style={{ marginLeft: '4.5rem' }}>
          {/* Background Image */}
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/5758168/pexels-photo-5758168.jpeg')",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          {/* Main Content */}
          <main className="flex-1 flex flex-col justify-center items-center p-6">
            {/* Store Name */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl mb-2">
                {storeInfo?.store_name || "Your Store"}
              </h2>
              <p className="text-lg text-white/80 drop-shadow-lg">
                {t.welcome}, {storeInfo?.owner_name}!
              </p>
            </div>
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-2xl text-center">
              {t.title}
            </h1>
            {/* Slogan */}
            <p className="text-2xl md:text-3xl text-white/90 mb-6 drop-shadow-lg font-medium text-center">
              {t.slogan}
            </p>
            <p className="text-lg md:text-xl text-white/80 mb-12 drop-shadow-lg text-center">
              {t.sloganEng}
            </p>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalCustomers}</div>
                <div className="text-sm text-white/80">{t.customers}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
                <CurrencyDisplay value={stats.totalCredit} decimals={0} className="text-red-400" />
                <div className="text-sm text-white/80">{t.creditGiven}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
                <CurrencyDisplay value={stats.totalDebit} decimals={0} className="text-green-400" />
                <div className="text-sm text-white/80">{t.paymentsReceived}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
                <CurrencyDisplay value={stats.netBalance} decimals={0} className={stats.netBalance >= 0 ? "text-red-400" : "text-green-400"} />
                <div className="text-sm text-white/80">{t.netOutstanding}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Non-authenticated user view (NO SIDEBAR, NO SCROLLBARS)
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/5758168/pexels-photo-5758168.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="container mx-auto flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="sm"
              className="text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm rounded-lg"
            >
              <Languages className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{language === 'hi' ? 'English' : 'हिंदी'}</span>
            </Button>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm rounded-lg">{t.login}</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{t.createAccount}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Centered Content */}
      <main className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl">
          {t.title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 drop-shadow-lg">
          {t.slogan}
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-2xl">
            {t.startToday}
          </Button>
        </Link>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="container mx-auto text-center">
          <p className="text-white/60 text-sm">
            {t.footerText}
          </p>
        </div>
      </footer>
    </div>
  )
}
