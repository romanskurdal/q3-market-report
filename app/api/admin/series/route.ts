import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    // Check if admin mode is enabled
    const adminMode = process.env.ADMIN_MODE === 'true'
    if (!adminMode) {
      return NextResponse.json(
        { error: 'Access restricted' },
        { status: 403 }
      )
    }

    const pool = await getDbConnection()
    
    // Get all available series with descriptions
    const result = await pool.request().query(`
      SELECT 
        APICode as code,
        Description as description,
        SOURCE as source
      FROM FinMaster
      ORDER BY APICode
    `)
    
    return NextResponse.json({
      count: result.recordset.length,
      series: result.recordset
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