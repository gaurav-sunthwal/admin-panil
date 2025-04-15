import { NextResponse } from "next/server"
import { createTables, seedDatabase } from "@/lib/db/migrations"

export async function GET() {
  try {
    await createTables()
    await seedDatabase()
    return NextResponse.json({ success: true, message: "Database setup completed successfully" })
  } catch (error) {
    console.error("Database setup failed:", error)
    return NextResponse.json(
      { success: false, message: "Database setup failed", error: String(error) },
      { status: 500 },
    )
  }
}
