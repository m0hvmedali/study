import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const subjectId = searchParams.get("subject_id")
    const difficulty = searchParams.get("difficulty")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit")

    let query = supabase
      .from("questions")
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

    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: questions, error } = await query

    if (error) {
      console.error("Error fetching questions:", error)
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }

    return NextResponse.json({ questions: questions || [] })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
