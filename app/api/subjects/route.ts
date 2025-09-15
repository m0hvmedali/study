import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: subjects, error } = await supabase.from("subjects").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching subjects:", error)
      return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
    }

    return NextResponse.json({ subjects: subjects || [] })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: subject, error } = await supabase.from("subjects").insert([body]).select().single()

    if (error) {
      console.error("Error creating subject:", error)
      return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
    }

    return NextResponse.json({ subject })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
