import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    const pool = await getDbConnection()
    
    // AIWeeklySummary schema: END_DATE, START_DATE (all uppercase with underscore)
    // Using exact column names from CREATE TABLE statement
    // Order by END_DATE to get the most recent weekly summary
    const result = await pool.request().query(`
      SELECT TOP 1 *
      FROM AIWeeklySummary
      ORDER BY END_DATE DESC
    `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json({
        message: 'No weekly summary found'
      })
    }
    
    return NextResponse.json({
      data: result.recordset[0]
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}