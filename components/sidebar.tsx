"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Users,
  Home,
  Package2,
  Settings,
  LogOut,
  Moon,
  Sun,
  IndianRupee,
  PlusCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getSupabaseClient } from "@/lib/supabase"
import React from "react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = getSupabaseClient()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/customers", icon: Users, label: "Customers" },
    {
      href: "/dashboard/transactions",
      icon: IndianRupee,
      label: "Transactions",
    },
  ]

  return (
    <aside
      className={`fixed top-4 left-4 z-20 flex flex-col h-[calc(100vh-2rem)] transition-all duration-300
        ${expanded ? 'w-48' : 'w-16'}
        bg-[rgba(30,30,30,0.7)] backdrop-blur-md shadow-xl rounded-3xl
      `}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className={`flex h-20 transition-all duration-300 ${expanded ? 'items-center pl-4 justify-start' : 'items-center justify-center'}`}>
        <Link href="/">
          <div className="flex items-center gap-2">
            <Package2 className="h-10 w-10" />
            {expanded && <span className="text-xl font-bold text-white whitespace-nowrap">KhataBook</span>}
          </div>
        </Link>
      </div>
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle theme</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  )
} 