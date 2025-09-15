"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const { signIn, signUp } = useAuth()

  const startCountdown = (seconds: number) => {
    setCountdown(seconds)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      if (error.message?.includes("For security purposes")) {
        const match = error.message.match(/(\d+) seconds/)
        const seconds = match ? Number.parseInt(match[1]) : 60
        setError(`يرجى الانتظار ${seconds} ثانية قبل المحاولة مرة أخرى`)
        startCountdown(seconds)
      } else if (error.message?.includes("Email not confirmed")) {
        setError("يرجى تأكيد بريدك الإلكتروني أولاً أو استخدام بريد إلكتروني آخر")
      } else if (error.message?.includes("Invalid login credentials")) {
        setError("بيانات تسجيل الدخول غير صحيحة")
      } else if (error.message?.includes("User already registered")) {
        setError("هذا البريد الإلكتروني مسجل بالفعل")
      } else {
        setError(error.message || "حدث خطأ أثناء المصادقة")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}</CardTitle>
        <CardDescription>{isSignUp ? "أدخل بياناتك لإنشاء حساب جديد" : "أدخل بياناتك لتسجيل الدخول"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
              {countdown > 0 && <div className="mt-1 font-mono">{countdown} ثانية متبقية</div>}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || countdown > 0}
          >
            {loading
              ? "جاري التحميل..."
              : countdown > 0
                ? `انتظر ${countdown}s`
                : isSignUp
                  ? "إنشاء حساب"
                  : "تسجيل الدخول"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-emerald-600">
            {isSignUp ? "لديك حساب بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حساباً جديداً"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
