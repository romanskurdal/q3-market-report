import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    const pool = await getDbConnection()
    
    // FinMaster schema: APICode, Description, SOURCE
    // Using exact column names from CREATE TABLE statement
    const result = await pool.request().query(`
      SELECT TOP 10 
        APICode as code,
        Description as name,
        SOURCE as source
      FROM FinMaster
      ORDER BY APICode
    `)
    
    return NextResponse.json({
      count: result.recordset.length,
      data: result.recordset
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