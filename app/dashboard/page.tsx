"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Trophy, Target, Clock, Star, Award, PlayCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { Chatbot } from "@/components/chatbot/chatbot"

const supabase = createClient()

interface Subject {
  id: string
  name: string
  name_ar: string
  description: string
  icon: string
  color: string
}

interface Lesson {
  id: string
  title: string
  title_ar: string
  difficulty_level: number
  points_reward: number
  subject: Subject
}

interface UserProgress {
  lesson_id: string
  completed_at: string | null
  score: number
  time_spent: number
}

interface Achievement {
  id: string
  achievement_type: string
  achievement_data: any
  earned_at: string
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

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalTimeSpent: 0,
    averageScore: 0,
  })

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase.from("subjects").select("*").order("name_ar")

      // Fetch recent lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6)

      // Fetch user progress
      const { data: progressData } = await supabase.from("user_progress").select("*").eq("user_id", user?.id)

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user?.id)
        .order("earned_at", { ascending: false })
        .limit(5)

      // Calculate stats
      const totalLessons = lessonsData?.length || 0
      const completedLessons = progressData?.filter((p) => p.completed_at).length || 0
      const totalTimeSpent = progressData?.reduce((sum, p) => sum + (p.time_spent || 0), 0) || 0
      const averageScore =
        progressData && progressData.length > 0
          ? progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length
          : 0

      setSubjects(subjectsData || [])
      setRecentLessons(lessonsData || [])
      setUserProgress(progressData || [])
      setAchievements(achievementsData || [])
      setStats({
        totalLessons,
        completedLessons,
        totalTimeSpent,
        averageScore,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-orange-500"
      case 4:
        return "bg-red-500"
      case 5:
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1:
        return "مبتدئ"
      case 2:
        return "متوسط"
      case 3:
        return "متقدم"
      case 4:
        return "صعب"
      case 5:
        return "خبير"
      default:
        return "غير محدد"
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
            <CardDescription>تحتاج إلى تسجيل الدخول للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const completionPercentage = stats.totalLessons > 0 ? (stats.completedLessons / stats.totalLessons) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial="initial" animate="animate" variants={staggerContainer}>
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-emerald-800 mb-2">مرحباً، {profile?.full_name || user.email}!</h1>
                <p className="text-gray-600">استمر في رحلتك التعليمية واكسب المزيد من النقاط</p>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-emerald-600">{profile?.points || 0} نقطة</div>
                <div className="text-sm text-gray-500">المستوى {profile?.level || 1}</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الدروس المكتملة</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.completedLessons}/{stats.totalLessons}
                </div>
                <Progress value={completionPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">وقت الدراسة</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{formatTime(stats.totalTimeSpent)}</div>
                <p className="text-xs text-muted-foreground mt-1">إجمالي الوقت المستغرق</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط الدرجات</CardTitle>
                <Star className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">{Math.round(stats.averageScore)}%</div>
                <p className="text-xs text-muted-foreground mt-1">من جميع الامتحانات</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإنجازات</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{achievements.length}</div>
                <p className="text-xs text-muted-foreground mt-1">إنجاز مكتسب</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">الدروس الحديثة</TabsTrigger>
              <TabsTrigger value="subjects">المواد الدراسية</TabsTrigger>
              <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      الدروس الحديثة
                    </CardTitle>
                    <CardDescription>ابدأ من حيث توقفت أو اكتشف دروساً جديدة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentLessons.map((lesson) => {
                        const isCompleted = userProgress.some((p) => p.lesson_id === lesson.id && p.completed_at)
                        return (
                          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-sm font-medium line-clamp-2">{lesson.title_ar}</CardTitle>
                                  <CardDescription className="text-xs mt-1">{lesson.subject?.name_ar}</CardDescription>
                                </div>
                                {isCompleted && <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between mb-3">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${getDifficultyColor(lesson.difficulty_level)} text-white`}
                                >
                                  {getDifficultyLabel(lesson.difficulty_level)}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-amber-600">
                                  <Trophy className="h-3 w-3" />
                                  {lesson.points_reward}
                                </div>
                              </div>
                              <Button size="sm" className="w-full" variant={isCompleted ? "outline" : "default"}>
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    مراجعة
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    ابدأ الدرس
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-600" />
                      المواد الدراسية
                    </CardTitle>
                    <CardDescription>اختر المادة التي تريد دراستها</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjects.map((subject) => (
                        <Card key={subject.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader className="text-center">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                            >
                              {subject.icon}
                            </div>
                            <CardTitle className="text-lg">{subject.name_ar}</CardTitle>
                            <CardDescription className="text-sm">{subject.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-center">
                            <Button className="w-full" style={{ backgroundColor: subject.color }}>
                              ابدأ الدراسة
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <motion.div variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      الإنجازات الأخيرة
                    </CardTitle>
                    <CardDescription>تتبع إنجازاتك ومكافآتك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {achievements.length > 0 ? (
                      <div className="space-y-4">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
                          >
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-yellow-800">
                                {achievement.achievement_type === "first_lesson" && "أول درس مكتمل!"}
                                {achievement.achievement_type === "points_milestone" && "معلم النقاط!"}
                                {achievement.achievement_type === "perfect_score" && "درجة كاملة!"}
                              </h4>
                              <p className="text-sm text-yellow-600">
                                تم الحصول عليه في {new Date(achievement.earned_at).toLocaleDateString("ar")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">لم تحصل على أي إنجازات بعد</p>
                        <p className="text-sm text-gray-400 mt-1">ابدأ بحل الدروس لكسب إنجازاتك الأولى!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Chatbot context="لوحة تحكم الطالب - يمكن للطالب هنا رؤية تقدمه في الدروس والنقاط والإنجازات" />
    </div>
  )
}
