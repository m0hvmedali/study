"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Trophy, MessageCircle, Brain } from "lucide-react"
import { AuthButton } from "@/components/auth/auth-button"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && mounted) {
      router.push("/dashboard")
    }
  }, [user, mounted, router])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-12 w-12 text-emerald-600" />
              <h1 className="text-5xl font-bold text-emerald-800">StudyForge</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              منصة تعليمية شاملة لتطوير مهاراتك الأكاديمية بطريقة تفاعلية ومبتكرة
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-12">
            <AuthButton />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16"
          >
            <motion.div variants={fadeInUp}>
              <Card className="text-center h-full">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle>دروس تفاعلية</CardTitle>
                  <CardDescription>محتوى تعليمي غني بالوسائط المتعددة والأمثلة العملية</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center h-full">
                <CardHeader>
                  <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                  <CardTitle>نظام النقاط</CardTitle>
                  <CardDescription>اكسب النقاط والإنجازات مع كل درس تكمله وامتحان تجتازه</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center h-full">
                <CardHeader>
                  <MessageCircle className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                  <CardTitle>مساعد ذكي</CardTitle>
                  <CardDescription>اسأل المساعد الذكي عن أي سؤال متعلق بالدروس والمناهج</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
