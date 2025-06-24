"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // 認証ページではヘッダーを表示しない
  if (pathname.startsWith("/auth/")) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
              モチログ
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="rounded-full" aria-label="メニュー">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <nav
            className={cn(
              "absolute top-full left-0 right-0 bg-background border-b md:static md:border-0 md:bg-transparent",
              isMenuOpen ? "block" : "hidden md:block",
            )}
          >
            <ul className="container flex flex-col md:flex-row md:items-center md:space-x-8 py-4 md:py-0">
              <li>
                <Link
                  href="/"
                  className={cn(
                    "block py-2 md:py-0 transition-colors text-base font-medium",
                    pathname === "/" ? "text-main-green" : "text-gray-700 hover:text-main-green",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ホーム
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className={cn(
                    "block py-2 md:py-0 transition-colors text-base font-medium",
                    pathname === "/history" ? "text-main-green" : "text-gray-700 hover:text-main-green",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  履歴
                </Link>
              </li>
              <li>
                <Link
                  href="/analysis"
                  className={cn(
                    "block py-2 md:py-0 transition-colors text-base font-medium",
                    pathname === "/analysis" ? "text-main-green" : "text-gray-700 hover:text-main-green",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  分析
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className={cn(
                    "block py-2 md:py-0 transition-colors text-base font-medium",
                    pathname === "/settings" ? "text-main-green" : "text-gray-700 hover:text-main-green",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  設定
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
