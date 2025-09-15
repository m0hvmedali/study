"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, BookOpen, Target, Star, HelpCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase"
import { Chatbot } from "@/components/chatbot/chatbot"

const supabase = createClient()

interface Question {
  id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer"
  options: string[]
  correct_answer: string
  explanation: string
  difficulty_level: number
  points: number
  source: string
  subject: {
    id: string
    name: string
    name_ar: string
    color: string
  }
}

interface Subject {
  id: string
  name: string
  name_ar: string
  color: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

export default function QuestionsPage() {
  const { user, profile, loading } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (user) {
      fetchQuestions()
      fetchSubjects()
    }
  }, [user])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, selectedSubject, selectedDifficulty, selectedType])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          subject:subjects(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("*").order("name_ar")

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((q) => q.question_text.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((q) => q.subject.id === selectedSubject)
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty_level === Number.parseInt(selectedDifficulty))
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((q) => q.question_type === selectedType)
    }

    setFilteredQuestions(filtered)
  }

  const toggleAnswer = (questionId: string) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "اختيار من متعدد"
      case "true_false":
        return "صح أم خطأ"
      case "short_answer":
        return "إجابة قصيرة"
      default:
        return type
    }
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
            <CardDescription>تحتاج إلى تسجيل الدخول للوصول إلى بنك الأسئلة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-emerald-800 mb-4">بنك الأسئلة</h1>
              <p className="text-xl text-gray-600 mb-8">استعرض وتدرب على آلاف الأسئلة في جميع المواد</p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={fadeInUp} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  البحث والتصفية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="ابحث في الأسئلة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المواد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المواد</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المستويات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="1">مبتدئ</SelectItem>
                      <SelectItem value="2">متوسط</SelectItem>
                      <SelectItem value="3">متقدم</SelectItem>
                      <SelectItem value="4">صعب</SelectItem>
                      <SelectItem value="5">خبير</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأنواع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                      <SelectItem value="true_false">صح أم خطأ</SelectItem>
                      <SelectItem value="short_answer">إجابة قصيرة</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-center">
                    <Badge variant="secondary" className="text-sm">
                      {filteredQuestions.length} سؤال
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions List */}
          <motion.div variants={fadeInUp}>
            <div className="space-y-6">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getDifficultyColor(question.difficulty_level)} text-white`}
                          >
                            {getDifficultyLabel(question.difficulty_level)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(question.question_type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-3 w-3" />
                            {question.points}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{question.question_text}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {question.subject.name_ar}
                          </span>
                          {question.source && (
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {question.source}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toggleAnswer(question.id)}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        {showAnswers[question.id] ? "إخفاء الإجابة" : "إظهار الإجابة"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg ${
                              showAnswers[question.id] && option === question.correct_answer
                                ? "border-green-500 bg-green-50 text-green-800"
                                : "border-gray-200"
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="flex gap-4 mb-4">
                        <div
                          className={`p-3 border rounded-lg flex-1 text-center ${
                            showAnswers[question.id] && question.correct_answer === "true"
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-200"
                          }`}
                        >
                          صحيح
                        </div>
                        <div
                          className={`p-3 border rounded-lg flex-1 text-center ${
                            showAnswers[question.id] && question.correct_answer === "false"
                              ? "border-green-500 bg-green-50 text-green-800"
                              : "border-gray-200"
                          }`}
                        >
                          خطأ
                        </div>
                      </div>
                    )}

                    {showAnswers[question.id] && (
                      <div className="space-y-3">
                        {question.question_type === "short_answer" && (
                          <div className="p-3 border border-green-500 bg-green-50 text-green-800 rounded-lg">
                            <strong>الإجابة:</strong> {question.correct_answer}
                          </div>
                        )}
                        {question.explanation && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">التفسير:</h4>
                            <p className="text-blue-700">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredQuestions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد أسئلة تطابق معايير البحث</p>
                    <p className="text-sm text-gray-400 mt-1">جرب تغيير المرشحات أو البحث بكلمات أخرى</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Chatbot context="بنك الأسئلة - يمكن للطالب هنا استعراض الأسئلة والتدرب عليها في جميع المواد الدراسية" />
    </div>
  )
}
