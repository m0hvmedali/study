"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Upload,
  Download,
  Play,
  ImageIcon,
  FileText,
  Video,
  Music,
  File,
  Eye,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@supabase/ssr"
import { Chatbot } from "@/components/chatbot/chatbot"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document"
  url: string
  size: number
  subject_id?: string
  lesson_id?: string
  uploaded_by: string
  created_at: string
  subject?: {
    name_ar: string
    color: string
  }
}

interface Subject {
  id: string
  name_ar: string
  color: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

export default function MediaPage() {
  const { user, profile, loading } = useAuth()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMediaFiles()
      fetchSubjects()
    }
  }, [user])

  useEffect(() => {
    filterFiles()
  }, [mediaFiles, searchTerm, selectedType, selectedSubject])

  const fetchMediaFiles = async () => {
    try {
      // Simulate media files data since we don't have actual file storage
      const sampleFiles: MediaFile[] = [
        {
          id: "1",
          name: "مقدمة في الكيمياء.mp4",
          type: "video",
          url: "/placeholder-video.mp4",
          size: 15728640, // 15MB
          subject_id: "chem-1",
          uploaded_by: "teacher-1",
          created_at: new Date().toISOString(),
          subject: { name_ar: "الكيمياء", color: "#059669" },
        },
        {
          id: "2",
          name: "الجدول الدوري.png",
          type: "image",
          url: "/periodic-table.jpg",
          size: 524288, // 512KB
          subject_id: "chem-1",
          uploaded_by: "teacher-1",
          created_at: new Date().toISOString(),
          subject: { name_ar: "الكيمياء", color: "#059669" },
        },
        {
          id: "3",
          name: "قوانين نيوتن.pdf",
          type: "document",
          url: "/placeholder-document.pdf",
          size: 1048576, // 1MB
          subject_id: "phys-1",
          uploaded_by: "teacher-1",
          created_at: new Date().toISOString(),
          subject: { name_ar: "الفيزياء", color: "#0891b2" },
        },
        {
          id: "4",
          name: "نشيد تعليمي.mp3",
          type: "audio",
          url: "/placeholder-audio.mp3",
          size: 3145728, // 3MB
          subject_id: "arab-1",
          uploaded_by: "teacher-1",
          created_at: new Date().toISOString(),
          subject: { name_ar: "اللغة العربية", color: "#d97706" },
        },
      ]

      setMediaFiles(sampleFiles)
    } catch (error) {
      console.error("Error fetching media files:", error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("id, name_ar, color").order("name_ar")

      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const filterFiles = () => {
    let filtered = mediaFiles

    if (searchTerm) {
      filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((file) => file.type === selectedType)
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter((file) => file.subject_id === selectedSubject)
    }

    setFilteredFiles(filtered)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-600" />
      case "video":
        return <Video className="h-8 w-8 text-red-600" />
      case "audio":
        return <Music className="h-8 w-8 text-purple-600" />
      case "document":
        return <FileText className="h-8 w-8 text-blue-600" />
      default:
        return <File className="h-8 w-8 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "image":
        return "صورة"
      case "video":
        return "فيديو"
      case "audio":
        return "صوت"
      case "document":
        return "مستند"
      default:
        return "ملف"
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would upload to Supabase Storage here
      console.log("Files would be uploaded:", files)

      // Refresh the media files list
      await fetchMediaFiles()
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setIsUploading(false)
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
            <CardDescription>تحتاج إلى تسجيل الدخول للوصول إلى مكتبة الوسائط</CardDescription>
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
                <h1 className="text-4xl font-bold text-emerald-800 mb-4">مكتبة الوسائط</h1>
                <p className="text-xl text-gray-600">جميع الملفات والوسائط التعليمية في مكان واحد</p>
              </div>
              {(profile.role === "teacher" || profile.role === "admin") && (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "جاري الرفع..." : "رفع ملفات"}
                    </Button>
                  </label>
                </div>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="ابحث في الملفات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value="image">الصور</option>
                    <option value="video">الفيديوهات</option>
                    <option value="audio">الملفات الصوتية</option>
                    <option value="document">المستندات</option>
                  </select>

                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">جميع المواد</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name_ar}
                      </option>
                    ))}
                  </select>

                  <div className="text-center">
                    <Badge variant="secondary" className="text-sm">
                      {filteredFiles.length} ملف
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media Files */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="grid" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="grid">عرض شبكي</TabsTrigger>
                <TabsTrigger value="list">عرض قائمة</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)}
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(file.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                            {(profile.role === "teacher" || profile.role === "admin") && (
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {file.type === "image" && (
                          <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <img
                              src={file.url || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/abstract-geometric-placeholder.png"
                              }}
                            />
                          </div>
                        )}

                        {file.type === "video" && (
                          <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <Play className="h-12 w-12 text-gray-400" />
                          </div>
                        )}

                        <h3 className="font-medium text-sm mb-2 line-clamp-2">{file.name}</h3>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>الحجم: {formatFileSize(file.size)}</div>
                          {file.subject && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: file.subject.color }} />
                              {file.subject.name_ar}
                            </div>
                          )}
                          <div>تاريخ الرفع: {new Date(file.created_at).toLocaleDateString("ar")}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            {getFileIcon(file.type)}
                            <div>
                              <h3 className="font-medium">{file.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{getTypeLabel(file.type)}</span>
                                <span>{formatFileSize(file.size)}</span>
                                {file.subject && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: file.subject.color }}
                                    />
                                    {file.subject.name_ar}
                                  </div>
                                )}
                                <span>{new Date(file.created_at).toLocaleDateString("ar")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              عرض
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              تحميل
                            </Button>
                            {(profile.role === "teacher" || profile.role === "admin") && (
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {filteredFiles.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">لا توجد ملفات تطابق معايير البحث</p>
                  <p className="text-sm text-gray-400 mt-1">جرب تغيير المرشحات أو البحث بكلمات أخرى</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </div>

      <Chatbot context="مكتبة الوسائط - يمكن للمستخدم هنا استعراض وإدارة جميع الملفات والوسائط التعليمية" />
    </div>
  )
}
