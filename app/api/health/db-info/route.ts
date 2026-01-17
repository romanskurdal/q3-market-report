import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    const pool = await getDbConnection()
    const result = await pool.request().query(`
      SELECT 
        DB_NAME() as databaseName,
        SUSER_SNAME() as loginName
    `)
    
    return NextResponse.json({
      databaseName: result.recordset[0]?.databaseName || null,
      loginName: result.recordset[0]?.loginName || null,
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