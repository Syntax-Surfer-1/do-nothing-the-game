import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const { id, name, score } = await request.json()

    // Check if user already has a score
    const { data: existing } = await supabase.from("scores").select("score").eq("id", id).single()

    // Only update if new score is better
    if (!existing || score > existing.score) {
      const { error } = await supabase.from("scores").upsert({ id, name, score }, { onConflict: "id" })

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to save score" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
