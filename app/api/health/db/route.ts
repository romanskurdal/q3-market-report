import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    const pool = await getDbConnection()
    const result = await pool.request().query('SELECT 1 as test')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}