import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDbConnection } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const apiCode = searchParams.get('apiCode')

    if (!apiCode) {
      return NextResponse.json(
        { error: 'apiCode parameter is required' },
        { status: 400 }
      )
    }

    const pool = await getDbConnection()
    
    // FinData schema: DATE, VALUE, API_CODE (all uppercase)
    // Using exact column names from CREATE TABLE statement
    // Parameterized query to prevent SQL injection
    const result = await pool.request()
      .input('apiCode', sql.NVarChar, apiCode)
      .query(`
        SELECT TOP 50
          DATE as date,
          VALUE as value
        FROM FinData
        WHERE API_CODE = @apiCode
        ORDER BY DATE DESC
      `)
    
    return NextResponse.json({
      apiCode,
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