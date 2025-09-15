"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Trophy, Star, Clock, Target, Play, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@supabase/ssr"
import { Chatbot } from "@/components/chatbot/chatbot"
import Link from "next/link"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Subject {
  id: string
  name: string
  name_ar: string
  description: string
  icon: string
  color: string
}

interface GameStats {
  subject_id: string
  total_questions: number
  completed_questions: number
  best_score: number
  total_time: number
}

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

export default function GamesPage() {
  const { user, profile, loading } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [gameStats, setGameStats] = useState<GameStats[]>([])
  const [overallStats, setOverallStats] = useState({
    totalGamesPlayed: 0,
    totalPoints: 0,
    averageScore: 0,
    totalTime: 0,
  })

  useEffect(() => {
    if (user) {
      fetchSubjects()
      fetchGameStats()
    }
  }, [user])

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase.from("subjects").select("*").order("name_ar")
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const fetchGameStats = async () => {
    try {
      // This would be a more complex query in a real app
      // For now, we'll simulate some stats
      const stats: GameStats[] = subjects.map((subject) => ({
        subject_id: subject.id,
        total_questions: Math.floor(Math.random() * 50) + 10,
        completed_questions: Math.floor(Math.random() * 30),
        best_score: Math.floor(Math.random() * 40) + 60,
        total_time: Math.floor(Math.random() * 3600) + 300,
      }))

      setGameStats(stats)

      // Calculate overall stats
      const totalGamesPlayed = stats.reduce((sum, stat) => sum + stat.completed_questions, 0)
      const totalPoints = stats.reduce((sum, stat) => sum + stat.best_score * stat.completed_questions, 0)
      const averageScore = totalGamesPlayed > 0 ? totalPoints / totalGamesPlayed : 0
      const totalTime = stats.reduce((sum, stat) => sum + stat.total_time, 0)

      setOverallStats({
        totalGamesPlayed,
        totalPoints,
        averageScore,
        totalTime,
      })
    } catch (error) {
      console.error("Error fetching game stats:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}س ${minutes}د`
    }
    return `${minutes}د`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
            <CardDescription>تحتاج إلى تسجيل الدخول للوصول إلى الألعاب</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-emerald-800 mb-4">الألعاب التعليمية</h1>
              <p className="text-xl text-gray-600 mb-8">تعلم واستمتع مع الألعاب التفاعلية في جميع المواد</p>
            </div>
          </motion.div>

          {/* Overall Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الألعاب المكتملة</CardTitle>
                <Gamepad2 className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{overallStats.totalGamesPlayed}</div>
                <p className="text-xs text-muted-foreground">لعبة مكتملة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">النقاط المكتسبة</CardTitle>
                <Trophy className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{Math.round(overallStats.totalPoints)}</div>
                <p className="text-xs text-muted-foreground">من الألعاب</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط النتائج</CardTitle>
                <Star className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">{Math.round(overallStats.averageScore)}%</div>
                <p className="text-xs text-muted-foreground">في جميع الألعاب</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">وقت اللعب</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatTime(overallStats.totalTime)}</div>
                <p className="text-xs text-muted-foreground">إجمالي الوقت</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Games */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  اختر المادة للعب
                </CardTitle>
                <CardDescription>اختبر معلوماتك في المواد المختلفة من خلال الألعاب التفاعلية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjects.map((subject) => {
                    const stats = gameStats.find((s) => s.subject_id === subject.id)
                    const completionPercentage =
                      stats && stats.total_questions > 0 ? (stats.completed_questions / stats.total_questions) * 100 : 0

                    return (
                      <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                            style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                          >
                            {subject.icon}
                          </div>
                          <CardTitle className="text-lg">{subject.name_ar}</CardTitle>
                          <CardDescription className="text-sm">{subject.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {stats && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>التقدم</span>
                                <span>
                                  {stats.completed_questions}/{stats.total_questions}
                                </span>
                              </div>
                              <Progress value={completionPercentage} />
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>أفضل نتيجة: {stats.best_score}%</span>
                                <span>الوقت: {formatTime(stats.total_time)}</span>
                              </div>
                            </div>
                          )}
                          <Link href={`/games/${subject.id}`}>
                            <Button className="w-full" style={{ backgroundColor: subject.color }}>
                              <Play className="h-4 w-4 mr-2" />
                              ابدأ اللعب
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Modes */}
          <motion.div variants={fadeInUp} className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-emerald-600" />
                  أنواع الألعاب المتاحة
                </CardTitle>
                <CardDescription>اختر نوع اللعبة المفضل لديك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">اختيار من متعدد</h3>
                    <p className="text-sm text-gray-600 mb-4">اختر الإجابة الصحيحة من بين الخيارات المتاحة</p>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      سهل - متوسط
                    </Badge>
                  </Card>

                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">صح أم خطأ</h3>
                    <p className="text-sm text-gray-600 mb-4">حدد ما إذا كانت العبارة صحيحة أم خاطئة</p>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      سهل
                    </Badge>
                  </Card>

                  <Card className="text-center p-6">
                    <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">تحدي الوقت</h3>
                    <p className="text-sm text-gray-600 mb-4">أجب على أكبر عدد من الأسئلة في وقت محدد</p>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                      صعب
                    </Badge>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      <Chatbot context="صفحة الألعاب التعليمية - يمكن للطالب هنا اللعب والتعلم من خلال الألعاب التفاعلية في جميع المواد الدراسية" />
    </div>
  )
}
