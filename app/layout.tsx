import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/hooks/use-auth"
import { Navigation } from "@/components/navigation/navigation"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "StudyForge - منصة تعليمية شاملة",
  description: "منصة تعليمية تفاعلية لتطوير مهاراتك الأكاديمية",
  generator: "StudyForge",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
