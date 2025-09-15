"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  BarChart3,
  Settings,
  Eye,
  Save,
  FileText,
  Video,
  ImageIcon,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import Chatbot from "@/components/chatbot" // Import the Chatbot component

const supabaseUrl = "https://urzxbbqelpnzitqvffhs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhiYnFlbHBueml0cXZmZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDE3MjAsImV4cCI6MjA2ODYxNzcyMH0._PQVKc-3lwovmGczX-rT0K0oHQVFktg0-0koEp3AM64";

const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


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
  content: any
  order_index: number
  difficulty_level: number
  points_reward: number
  is_published: boolean
  subject: Subject
  created_at: string
}

interface LessonFormData {
  title: string
  title_ar: string
  subject_id: string
  difficulty_level: number
  points_reward: number
  content: {
    sections: Array<{
      type: "text" | "video" | "image" | "quiz"
      content: string
      title?: string
    }>
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    title_ar: "",
    subject_id: "",
    difficulty_level: 1,
    points_reward: 10,
    content: { sections: [] },
  })
  const [stats, setStats] = useState({
    totalLessons: 0,
    publishedLessons: 0,
    totalStudents: 0,
    totalQuestions: 0,
  })

  useEffect(() => {
    if (user && profile) {
      if (profile.role !== "teacher" && profile.role !== "admin") {
        router.push("/dashboard")
        return
      }
      fetchAdminData()
    }
  }, [user, profile, router])

  const fetchAdminData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase.from("subjects").select("*").order("name_ar")

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select(`
          *,
          subject:subjects(*)
        `)
        .order("created_at", { ascending: false })

      // Fetch stats
      const { count: totalStudents } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student")

      const { count: totalQuestions } = await supabase.from("questions").select("*", { count: "exact", head: true })

      const totalLessons = lessonsData?.length || 0
      const publishedLessons = lessonsData?.filter((l) => l.is_published).length || 0

      setSubjects(subjectsData || [])
      setLessons(lessonsData || [])
      setStats({
        totalLessons,
        publishedLessons,
        totalStudents: totalStudents || 0,
        totalQuestions: totalQuestions || 0,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
    }
  }

  const handleCreateLesson = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .insert([
          {
            ...formData,
            created_by: user?.id,
            order_index: lessons.length + 1,
          },
        ])
        .select(`
          *,
          subject:subjects(*)
        `)

      if (error) throw error

      if (data) {
        setLessons([data[0], ...lessons])
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
    }
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson) return

    try {
      const { data, error } = await supabase
        .from("lessons")
        .update(formData)
        .eq("id", editingLesson.id)
        .select(`
          *,
          subject:subjects(*)
        `)

      if (error) throw error

      if (data) {
        setLessons(lessons.map((l) => (l.id === editingLesson.id ? data[0] : l)))
        setEditingLesson(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error updating lesson:", error)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

      if (error) throw error

      setLessons(lessons.filter((l) => l.id !== lessonId))
    } catch (error) {
      console.error("Error deleting lesson:", error)
    }
  }

  const handlePublishToggle = async (lesson: Lesson) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ is_published: !lesson.is_published })
        .eq("id", lesson.id)

      if (error) throw error

      setLessons(lessons.map((l) => (l.id === lesson.id ? { ...l, is_published: !l.is_published } : l)))
    } catch (error) {
      console.error("Error toggling publish status:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      title_ar: "",
      subject_id: "",
      difficulty_level: 1,
      points_reward: 10,
      content: { sections: [] },
    })
  }

  const addContentSection = (type: "text" | "video" | "image" | "quiz") => {
    setFormData({
      ...formData,
      content: {
        sections: [...formData.content.sections, { type, content: "", title: "" }],
      },
    })
  }

  const updateContentSection = (index: number, field: string, value: string) => {
    const newSections = [...formData.content.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setFormData({
      ...formData,
      content: { sections: newSections },
    })
  }

  const removeContentSection = (index: number) => {
    setFormData({
      ...formData,
      content: {
        sections: formData.content.sections.filter((_, i) => i !== index),
      },
    })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user || !profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>غير مصرح</CardTitle>
            <CardDescription>تحتاج إلى صلاحيات معلم للوصول إلى هذه الصفحة</CardDescription>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-emerald-800 mb-2">لوحة تحكم المعلم</h1>
                <p className="text-gray-600">إدارة الدروس والمحتوى التعليمي</p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    درس جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إنشاء درس جديد</DialogTitle>
                    <DialogDescription>أضف محتوى تعليمي جديد للطلاب</DialogDescription>
                  </DialogHeader>
                  <LessonForm
                    formData={formData}
                    setFormData={setFormData}
                    subjects={subjects}
                    onSave={handleCreateLesson}
                    onCancel={() => {
                      setIsCreateDialogOpen(false)
                      resetForm()
                    }}
                    addContentSection={addContentSection}
                    updateContentSection={updateContentSection}
                    removeContentSection={removeContentSection}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الدروس</CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{stats.totalLessons}</div>
                <p className="text-xs text-muted-foreground">{stats.publishedLessons} منشور</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الطلاب</CardTitle>
                <Users className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">طالب مسجل</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">بنك الأسئلة</CardTitle>
                <BarChart3 className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">سؤال متاح</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المواد</CardTitle>
                <Settings className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{subjects.length}</div>
                <p className="text-xs text-muted-foreground">مادة دراسية</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lessons Management */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  إدارة الدروس
                </CardTitle>
                <CardDescription>عرض وتحرير جميع الدروس</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{lesson.title_ar}</h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getDifficultyColor(lesson.difficulty_level)} text-white`}
                          >
                            {getDifficultyLabel(lesson.difficulty_level)}
                          </Badge>
                          <Badge variant={lesson.is_published ? "default" : "secondary"}>
                            {lesson.is_published ? "منشور" : "مسودة"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{lesson.subject?.name_ar}</span>
                          <span>{lesson.points_reward} نقطة</span>
                          <span>{new Date(lesson.created_at).toLocaleDateString("ar")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handlePublishToggle(lesson)}>
                          <Eye className="h-4 w-4" />
                          {lesson.is_published ? "إخفاء" : "نشر"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLesson(lesson)
                            setFormData({
                              title: lesson.title,
                              title_ar: lesson.title_ar,
                              subject_id: lesson.subject?.id || "",
                              difficulty_level: lesson.difficulty_level,
                              points_reward: lesson.points_reward,
                              content: lesson.content || { sections: [] },
                            })
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteLesson(lesson.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Lesson Dialog */}
          {editingLesson && (
            <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>تحرير الدرس</DialogTitle>
                  <DialogDescription>تعديل محتوى الدرس</DialogDescription>
                </DialogHeader>
                <LessonForm
                  formData={formData}
                  setFormData={setFormData}
                  subjects={subjects}
                  onSave={handleUpdateLesson}
                  onCancel={() => {
                    setEditingLesson(null)
                    resetForm()
                  }}
                  addContentSection={addContentSection}
                  updateContentSection={updateContentSection}
                  removeContentSection={removeContentSection}
                />
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </div>
      <Chatbot context="لوحة تحكم المعلم - يمكن للمعلم هنا إدارة الدروس وإنشاء محتوى تعليمي جديد" />
    </div>
  )
}

// Lesson Form Component
function LessonForm({
  formData,
  setFormData,
  subjects,
  onSave,
  onCancel,
  addContentSection,
  updateContentSection,
  removeContentSection,
}: {
  formData: LessonFormData
  setFormData: (data: LessonFormData) => void
  subjects: Subject[]
  onSave: () => void
  onCancel: () => void
  addContentSection: (type: "text" | "video" | "image" | "quiz") => void
  updateContentSection: (index: number, field: string, value: string) => void
  removeContentSection: (index: number) => void
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_ar">عنوان الدرس (عربي)</Label>
          <Input
            id="title_ar"
            value={formData.title_ar}
            onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
            placeholder="أدخل عنوان الدرس بالعربية"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الدرس (إنجليزي)</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter lesson title in English"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">المادة</Label>
          <Select
            value={formData.subject_id}
            onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">مستوى الصعوبة</Label>
          <Select
            value={formData.difficulty_level.toString()}
            onValueChange={(value) => setFormData({ ...formData, difficulty_level: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">مبتدئ</SelectItem>
              <SelectItem value="2">متوسط</SelectItem>
              <SelectItem value="3">متقدم</SelectItem>
              <SelectItem value="4">صعب</SelectItem>
              <SelectItem value="5">خبير</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">النقاط</Label>
          <Input
            id="points"
            type="number"
            value={formData.points_reward}
            onChange={(e) => setFormData({ ...formData, points_reward: Number.parseInt(e.target.value) || 0 })}
            min="1"
            max="100"
          />
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">محتوى الدرس</Label>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => addContentSection("text")}>
              <FileText className="h-4 w-4 mr-1" />
              نص
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => addContentSection("video")}>
              <Video className="h-4 w-4 mr-1" />
              فيديو
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => addContentSection("image")}>
              <ImageIcon className="h-4 w-4 mr-1" />
              صورة
            </Button>
          </div>
        </div>

        {formData.content.sections.map((section, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary">
                {section.type === "text" && "نص"}
                {section.type === "video" && "فيديو"}
                {section.type === "image" && "صورة"}
                {section.type === "quiz" && "اختبار"}
              </Badge>
              <Button type="button" size="sm" variant="outline" onClick={() => removeContentSection(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="عنوان القسم (اختياري)"
                value={section.title || ""}
                onChange={(e) => updateContentSection(index, "title", e.target.value)}
              />

              {section.type === "text" && (
                <Textarea
                  placeholder="محتوى النص..."
                  value={section.content}
                  onChange={(e) => updateContentSection(index, "content", e.target.value)}
                  rows={4}
                />
              )}

              {(section.type === "video" || section.type === "image") && (
                <Input
                  placeholder={section.type === "video" ? "رابط الفيديو أو مسار الملف" : "رابط الصورة أو مسار الملف"}
                  value={section.content}
                  onChange={(e) => updateContentSection(index, "content", e.target.value)}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="button" onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4 mr-2" />
          حفظ
        </Button>
      </div>
    </div>
  )
}
