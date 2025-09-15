"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Clock, Star, Search, Filter, Play, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"

interface Subject {
  id: string
  name: string
  name_ar: string
  description: string
  color: string
}

interface Lesson {
  id: string
  title: string
  description: string
  subject_id: string
  difficulty_level: "beginner" | "intermediate" | "advanced"
  estimated_duration: number
  content: any
  created_at: string
  subjects?: Subject
}

interface LessonProgress {
  lesson_id: string
  progress_percentage: number
  completed: boolean
}

export default function LessonsPage() {
  const { user, profile } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: subjectsData, error: subjectsError } = await supabase.from("subjects").select("*")

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError)
        setSubjects([])
      } else {
        setSubjects(subjectsData || [])
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select(`
          *,
          subjects (
            id,
            name,
            name_ar,
            description,
            color
          )
        `)
        .order("created_at", { ascending: false })

      if (lessonsError) {
        console.error("Error fetching lessons:", lessonsError)
        setLessons([])
      } else {
        setLessons(lessonsData || [])
      }

      if (user) {
        const { data: progressData, error: progressError } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id)

        if (progressError) {
          console.error("Error fetching progress:", progressError)
          setProgress([])
        } else {
          setProgress(progressData || [])
        }
      }
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || lesson.subject_id === selectedSubject
    const matchesDifficulty = selectedDifficulty === "all" || lesson.difficulty_level === selectedDifficulty

    return matchesSearch && matchesSubject && matchesDifficulty
  })

  const getLessonProgress = (lessonId: string) => {
    return progress.find((p) => p.lesson_id === lessonId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "مبتدئ"
      case "intermediate":
        return "متوسط"
      case "advanced":
        return "متقدم"
      default:
        return difficulty
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in shadow-card-enhanced">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-glow">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription>يرجى تسجيل الدخول للوصول إلى الدروس</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300">
                تسجيل الدخول
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center animate-slide-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 animate-float">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">مكتبة الدروس</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 text-pretty max-w-2xl mx-auto">
              اكتشف مجموعة واسعة من الدروس التفاعلية المصممة لتطوير مهاراتك
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Star className="w-4 h-4" />
                <span>{lessons.length} درس متاح</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span>{progress.filter((p) => p.completed).length} درس مكتمل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-card-enhanced animate-slide-in-up">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ابحث عن درس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-300 focus:shadow-glow"
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواد</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name_ar || subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="مستوى الصعوبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="beginner">مبتدئ</SelectItem>
                  <SelectItem value="intermediate">متوسط</SelectItem>
                  <SelectItem value="advanced">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          <Card className="text-center py-12 animate-scale-in">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد دروس</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSubject !== "all" || selectedDifficulty !== "all"
                  ? "لم يتم العثور على دروس تطابق معايير البحث"
                  : "لا توجد دروس متاحة حالياً"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson, index) => {
              const lessonProgress = getLessonProgress(lesson.id)
              const isCompleted = lessonProgress?.completed || false
              const progressPercentage = lessonProgress?.progress_percentage || 0

              return (
                <Card
                  key={lesson.id}
                  className="hover-lift shadow-card-enhanced animate-slide-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                        {getDifficultyText(lesson.difficulty_level)}
                      </Badge>
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-500 animate-scale-in" />}
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lesson.subjects?.name_ar || lesson.subjects?.name || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.estimated_duration} دقيقة</span>
                        </div>
                      </div>

                      {progressPercentage > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      )}

                      <Link href={`/lessons/${lesson.id}`}>
                        <Button className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 group-hover:shadow-glow">
                          <Play className="w-4 h-4 mr-2" />
                          {isCompleted ? "مراجعة الدرس" : progressPercentage > 0 ? "متابعة الدرس" : "بدء الدرس"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
