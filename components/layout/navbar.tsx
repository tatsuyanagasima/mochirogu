"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, BarChart2, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navItems = [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/history", label: "履歴", icon: Calendar },
    { href: "/analysis", label: "分析", icon: BarChart2 },
    { href: "/settings", label: "設定", icon: Settings },
  ]

  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="container flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors",
                isActive ? "text-main-green font-medium" : "text-gray-700 hover:text-main-green",
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors text-gray-700 hover:text-red-500"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span>ログアウト</span>
        </button>
      </div>
    </nav>
  )
}
