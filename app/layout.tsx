"use client"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const noSidebarRoutes = ["/auth/login", "/auth/signup", "/"]
  const showSidebar = !noSidebarRoutes.includes(pathname)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            {showSidebar && <Sidebar />}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 sm:ml-14">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
