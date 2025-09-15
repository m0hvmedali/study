"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, Clock, CheckCircle, X, RotateCcw, Star, Target, Zap } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@supabase/ssr"
import { useParams, useRouter } from "next/navigation"
import { Chatbot } from "@/components/chatbot/chatbot"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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
}

interface Subject {
  id: string
  name: string
  name_ar: string
  color: string
  icon: string
}

interface GameState {
  questions: Question[]
  currentQuestionIndex: number
  score: number
  correctAnswers: number
  timeLeft: number
  gameMode: "practice" | "timed" | "challenge"
  isGameActive: boolean
  selectedAnswer: string | null
  showResult: boolean
  gameCompleted: boolean
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

const slideIn = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3 },
}

export default function SubjectGamePage() {
  const { user, profile } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    timeLeft: 300, // 5 minutes
    gameMode: "practice",
    isGameActive: false,
    selectedAnswer: null,
    showResult: false,
    gameCompleted: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.subjectId) {
      fetchSubject()
      fetchQuestions()
    }
  }, [params.subjectId])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState.isGameActive && gameState.timeLeft > 0 && gameState.gameMode === "timed") {
      timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (gameState.timeLeft === 0 && gameState.gameMode === "timed") {
      endGame()
    }
    return () => clearTimeout(timer)
  }, [gameState.isGameActive, gameState.timeLeft, gameState.gameMode])

  const fetchSubject = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("*").eq("id", params.subjectId).single()

      if (error) throw error
      setSubject(data)
    } catch (error) {
      console.error("Error fetching subject:", error)
    }
  }

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject_id", params.subjectId)
        .order("difficulty_level")
        .limit(20)

      if (error) throw error

      setGameState((prev) => ({
        ...prev,
        questions: data || [],
      }))
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const startGame = (mode: "practice" | "timed" | "challenge") => {
    const shuffledQuestions = [...gameState.questions].sort(() => Math.random() - 0.5)
    setGameState({
      ...gameState,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      score: 0,
      correctAnswers: 0,
      timeLeft: mode === "timed" ? 300 : 0,
      gameMode: mode,
      isGameActive: true,
      selectedAnswer: null,
      showResult: false,
      gameCompleted: false,
    })
  }

  const selectAnswer = (answer: string) => {
    if (gameState.selectedAnswer || gameState.showResult) return

    setGameState((prev) => ({
      ...prev,
      selectedAnswer: answer,
      showResult: true,
    }))

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
    const isCorrect = answer === currentQuestion.correct_answer

    if (isCorrect) {
      setGameState((prev) => ({
        ...prev,
        score: prev.score + currentQuestion.points,
        correctAnswers: prev.correctAnswers + 1,
      }))
    }

    // Auto advance after 2 seconds
    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1

    if (nextIndex >= gameState.questions.length) {
      endGame()
    } else {
      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: null,
        showResult: false,
      }))
    }
  }

  const endGame = async () => {
    setGameState((prev) => ({
      ...prev,
      isGameActive: false,
      gameCompleted: true,
    }))

    // Save game results (simplified)
    if (user && gameState.score > 0) {
      try {
        await supabase.rpc("update_user_points", {
          user_uuid: user.id,
          points_to_add: Math.floor(gameState.score / 10),
        })
      } catch (error) {
        console.error("Error updating points:", error)
      }
    }
  }

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      currentQuestionIndex: 0,
      score: 0,
      correctAnswers: 0,
      timeLeft: 300,
      isGameActive: false,
      selectedAnswer: null,
      showResult: false,
      gameCompleted: false,
    }))
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!subject || gameState.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>لا توجد أسئلة متاحة</CardTitle>
            <CardDescription>لم يتم العثور على أسئلة لهذه المادة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
  const progressPercentage = ((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100

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
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة
              </Button>
            </div>

            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
              >
                {subject.icon}
              </div>
              <h1 className="text-3xl font-bold text-emerald-800 mb-2">لعبة {subject.name_ar}</h1>
              <p className="text-gray-600">اختبر معلوماتك واكسب النقاط</p>
            </div>
          </motion.div>

          {!gameState.isGameActive && !gameState.gameCompleted && (
            <motion.div variants={fadeInUp}>
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <CardTitle>اختر نوع اللعبة</CardTitle>
                  <CardDescription>اختر الطريقة التي تفضل اللعب بها</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">تدريب</h3>
                      <p className="text-sm text-gray-600 mb-4">تدرب بدون ضغط الوقت</p>
                      <Button onClick={() => startGame("practice")} className="w-full bg-emerald-600">
                        ابدأ التدريب
                      </Button>
                    </Card>

                    <Card className="text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">تحدي الوقت</h3>
                      <p className="text-sm text-gray-600 mb-4">5 دقائق لحل أكبر عدد من الأسئلة</p>
                      <Button onClick={() => startGame("timed")} className="w-full bg-amber-600">
                        ابدأ التحدي
                      </Button>
                    </Card>

                    <Card className="text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="h-8 w-8 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">تحدي صعب</h3>
                      <p className="text-sm text-gray-600 mb-4">أسئلة صعبة بنقاط مضاعفة</p>
                      <Button onClick={() => startGame("challenge")} className="w-full bg-cyan-600">
                        ابدأ التحدي
                      </Button>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState.isGameActive && currentQuestion && (
            <motion.div variants={fadeInUp}>
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className={`${getDifficultyColor(currentQuestion.difficulty_level)} text-white`}
                      >
                        {getDifficultyLabel(currentQuestion.difficulty_level)}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Trophy className="h-4 w-4" />
                        {currentQuestion.points} نقطة
                      </div>
                    </div>
                    {gameState.gameMode === "timed" && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Clock className="h-4 w-4" />
                        {formatTime(gameState.timeLeft)}
                      </div>
                    )}
                  </div>
                  <Progress value={progressPercentage} className="mb-4" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      السؤال {gameState.currentQuestionIndex + 1} من {gameState.questions.length}
                    </span>
                    <span>النقاط: {gameState.score}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={gameState.currentQuestionIndex}
                      variants={slideIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <h2 className="text-xl font-semibold text-emerald-800 mb-6">{currentQuestion.question_text}</h2>

                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                          let buttonClass = "w-full text-right p-4 border-2 transition-all"
                          let icon = null

                          if (gameState.showResult) {
                            if (option === currentQuestion.correct_answer) {
                              buttonClass += " border-green-500 bg-green-50 text-green-800"
                              icon = <CheckCircle className="h-5 w-5 text-green-600" />
                            } else if (
                              option === gameState.selectedAnswer &&
                              option !== currentQuestion.correct_answer
                            ) {
                              buttonClass += " border-red-500 bg-red-50 text-red-800"
                              icon = <X className="h-5 w-5 text-red-600" />
                            } else {
                              buttonClass += " border-gray-200 bg-gray-50"
                            }
                          } else {
                            buttonClass += " border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                          }

                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={buttonClass}
                              onClick={() => selectAnswer(option)}
                              disabled={gameState.showResult}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{option}</span>
                                {icon}
                              </div>
                            </Button>
                          )
                        })}
                      </div>

                      {gameState.showResult && currentQuestion.explanation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <h4 className="font-semibold text-blue-800 mb-2">التفسير:</h4>
                          <p className="text-blue-700">{currentQuestion.explanation}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState.gameCompleted && (
            <motion.div variants={fadeInUp}>
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-10 w-10 text-emerald-600" />
                  </div>
                  <CardTitle className="text-2xl text-emerald-800">تهانينا!</CardTitle>
                  <CardDescription>لقد أكملت اللعبة بنجاح</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">{gameState.score}</div>
                      <div className="text-sm text-gray-600">النقاط المكتسبة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">
                        {Math.round((gameState.correctAnswers / gameState.questions.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">نسبة النجاح</div>
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">
                        {gameState.correctAnswers} من {gameState.questions.length} إجابة صحيحة
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={resetGame} variant="outline" className="flex-1 bg-transparent">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      لعب مرة أخرى
                    </Button>
                    <Button onClick={() => router.push("/games")} className="flex-1 bg-emerald-600">
                      العودة للألعاب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Chatbot
        context={`لعبة ${subject.name_ar} - يمكن للطالب أن يسأل عن أي سؤال متعلق بالمادة أو يطلب المساعدة في فهم الأسئلة`}
      />
    </div>
  )
}
