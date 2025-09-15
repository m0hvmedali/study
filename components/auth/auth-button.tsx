"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, User, Crown, Trophy } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function AuthButton() {
  const { user, profile, signIn, signOut, loading } = useAuth()

  if (loading) {
    return <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-md" />
  }

  if (!user || !profile) {
    return (
      <Button onClick={signIn} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
        تسجيل الدخول بجوجل
      </Button>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "teacher":
        return <User className="h-4 w-4 text-blue-500" />
      default:
        return <Trophy className="h-4 w-4 text-emerald-500" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدير"
      case "teacher":
        return "معلم"
      default:
        return "طالب"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-auto px-3 rounded-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || "User"} />
              <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{profile.full_name}</span>
                {getRoleIcon(profile.role)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {profile.points} نقطة
                </Badge>
                <Badge variant="outline" className="text-xs">
                  المستوى {profile.level}
                </Badge>
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex items-center justify-start gap-3 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || "User"} />
            <AvatarFallback>{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex items-center gap-2">
              <p className="font-medium">{profile.full_name}</p>
              {getRoleIcon(profile.role)}
            </div>
            <p className="w-[180px] truncate text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getRoleLabel(profile.role)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {profile.points} نقطة
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>الملف الشخصي</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        {profile.role === "teacher" || profile.role === "admin" ? (
          <DropdownMenuItem>
            <Crown className="mr-2 h-4 w-4" />
            <span>لوحة التحكم</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
