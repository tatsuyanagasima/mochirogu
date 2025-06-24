import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Navbar from "@/components/layout/navbar"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
})

export const metadata = {
  title: "モチログ - 習慣と気分の記録アプリ",
  description: "習慣と気分を記録して自分を知ろう",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} font-sans`}>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Navbar />
          <Footer />
        </div>
      </body>
    </html>
  )
}
