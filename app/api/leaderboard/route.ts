import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Database configuration error" }, { status: 500 })
    }

    const { data, error } = await supabase.from("scores").select("*").order("score", { ascending: false }).limit(10)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
