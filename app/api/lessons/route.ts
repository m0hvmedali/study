import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const subjectId = searchParams.get("subject_id")
    const difficulty = searchParams.get("difficulty")
    const search = searchParams.get("search")
    const userId = searchParams.get("user_id")

    let query = supabase
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

    if (subjectId && subjectId !== "all") {
      query = query.eq("subject_id", subjectId)
    }

    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty_level", difficulty)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: lessons, error: lessonsError } = await query

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError)
      return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
    }

    let progress = []
    if (userId) {
      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", userId)

      if (progressError) {
        console.error("Error fetching progress:", progressError)
      } else {
        progress = progressData || []
      }
    }

    return NextResponse.json({
      lessons: lessons || [],
      progress: progress,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
