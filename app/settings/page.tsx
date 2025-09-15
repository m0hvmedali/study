"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
}

export default function SettingsPage() {
  const { user, profile, loading } = useAuth()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      lessons: true,
      achievements: true,
      games: false,
    },
    privacy: {
      profileVisible: true,
      progressVisible: false,
      achievementsVisible: true,
    },
    preferences: {
      language: "ar",
      theme: "light",
      animations: true,
      sounds: true,
    },
    spotify: {
      connected: false,
      playlistId: "",
    },
  })

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const saveSettings = async () => {
    try {
      // In a real app, save to Supabase
      console.log("Saving settings:", settings)
      // Show success message
    } catch (error) {
      console.error("Error saving settings:", error)
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
            <CardDescription>تحتاج إلى تسجيل الدخول للوصول إلى الإعدادات</CardDescription>
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
              <h1 className="text-4xl font-bold text-emerald-800 mb-4">الإعدادات</h1>
              <p className="text-xl text-gray-600">تخصيص تجربتك التعليمية</p>
            </div>
          </motion.div>

          {/* Settings Tabs */}
          <motion.div variants={fadeInUp}>
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
                <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
                <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
                <TabsTrigger value="about">حول الموقع</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-600" />
                      معلومات الملف الشخصي
                    </CardTitle>
                    <CardDescription>تحديث معلوماتك الشخصية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">الاسم الكامل</Label>
                        <Input id="fullName" value={profile.full_name || ""} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input id="email" value={profile.email} readOnly />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>الدور</Label>
                        <Badge variant="secondary" className="w-fit">
                          {profile.role === "student" && "طالب"}
                          {profile.role === "teacher" && "معلم"}
                          {profile.role === "admin" && "مدير"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>النقاط</Label>
                        <Badge variant="outline" className="w-fit text-emerald-600">
                          {profile.points || 0} نقطة
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>المستوى</Label>
                        <Badge variant="outline" className="w-fit text-amber-600">
                          المستوى {Math.floor((profile.points || 0) / 100) + 1}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الإشعارات</CardTitle>
                    <CardDescription>تحكم في الإشعارات التي تريد استلامها</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-sm font-medium">
                          {key === "email" && "إشعارات البريد الإلكتروني"}
                          {key === "push" && "الإشعارات المنبثقة"}
                          {key === "lessons" && "إشعارات الدروس الجديدة"}
                          {key === "achievements" && "إشعارات الإنجازات"}
                          {key === "games" && "إشعارات الألعاب"}
                        </Label>
                        <input
                          type="checkbox"
                          id={key}
                          checked={value}
                          onChange={(e) => handleSettingChange("notifications", key, e.target.checked)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الخصوصية</CardTitle>
                    <CardDescription>تحكم في مشاركة معلوماتك</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(settings.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-sm font-medium">
                          {key === "profileVisible" && "إظهار الملف الشخصي للآخرين"}
                          {key === "progressVisible" && "إظهار التقدم الأكاديمي"}
                          {key === "achievementsVisible" && "إظهار الإنجازات"}
                        </Label>
                        <input
                          type="checkbox"
                          id={key}
                          checked={value}
                          onChange={(e) => handleSettingChange("privacy", key, e.target.checked)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Settings */}
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>التفضيلات العامة</CardTitle>
                    <CardDescription>تخصيص واجهة المستخدم</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">اللغة</Label>
                        <select
                          id="language"
                          value={settings.preferences.language}
                          onChange={(e) => handleSettingChange("preferences", "language", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme">المظهر</Label>
                        <select
                          id="theme"
                          value={settings.preferences.theme}
                          onChange={(e) => handleSettingChange("preferences", "theme", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="light">فاتح</option>
                          <option value="dark">داكن</option>
                          <option value="auto">تلقائي</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="animations">تفعيل الحركات</Label>
                        <input
                          type="checkbox"
                          id="animations"
                          checked={settings.preferences.animations}
                          onChange={(e) => handleSettingChange("preferences", "animations", e.target.checked)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sounds">تفعيل الأصوات</Label>
                        <input
                          type="checkbox"
                          id="sounds"
                          checked={settings.preferences.sounds}
                          onChange={(e) => handleSettingChange("preferences", "sounds", e.target.checked)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Spotify Integration */}
                <Card>
                  <CardHeader>
                    <CardTitle>تكامل Spotify</CardTitle>
                    <CardDescription>ربط حسابك مع Spotify للاستماع للموسيقى أثناء الدراسة</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>حالة الاتصال</Label>
                      <Badge variant={settings.spotify.connected ? "default" : "secondary"}>
                        {settings.spotify.connected ? "متصل" : "غير متصل"}
                      </Badge>
                    </div>
                    {settings.spotify.connected && (
                      <div className="space-y-2">
                        <Label htmlFor="playlistId">معرف قائمة التشغيل</Label>
                        <Input
                          id="playlistId"
                          value={settings.spotify.playlistId}
                          onChange={(e) => handleSettingChange("spotify", "playlistId", e.target.value)}
                          placeholder="أدخل معرف قائمة التشغيل"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* About Settings */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>حول StudyForge</CardTitle>
                    <CardDescription>معلومات عن المنصة التعليمية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="text-6xl font-bold text-emerald-600">📚</div>
                      <h3 className="text-2xl font-bold text-emerald-800">StudyForge</h3>
                      <p className="text-gray-600">منصة تعليمية شاملة لتطوير المهارات الأكاديمية</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">1.0.0</div>
                          <div className="text-sm text-gray-500">الإصدار</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600">2024</div>
                          <div className="text-sm text-gray-500">سنة الإطلاق</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sky-600">مجاني</div>
                          <div className="text-sm text-gray-500">النوع</div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                        <h4 className="font-semibold text-emerald-800 mb-2">الميزات الرئيسية:</h4>
                        <ul className="text-sm text-emerald-700 space-y-1">
                          <li>• نظام إدارة الدروس التفاعلي</li>
                          <li>• ألعاب تعليمية لجميع المواد</li>
                          <li>• نظام النقاط والإنجازات</li>
                          <li>• مساعد ذكي للإجابة على الأسئلة</li>
                          <li>• لوحة بيضاء تفاعلية</li>
                          <li>• مكتبة وسائط شاملة</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
