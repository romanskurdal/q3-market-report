import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

const TABLES_TO_CHECK = ['FinMaster', 'FinData', 'Folders', 'PdfAnalysis', 'AIWeeklySummary']

export async function GET() {
  try {
    const pool = await getDbConnection()
    
    const tableList = TABLES_TO_CHECK.map(name => `'${name}'`).join(',')
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' 
      AND TABLE_NAME IN (${tableList})
    `)
    
    const existingTables = result.recordset.map((row: any) => row.TABLE_NAME)
    const tableStatus = TABLES_TO_CHECK.reduce((acc, tableName) => {
      acc[tableName] = existingTables.includes(tableName)
      return acc
    }, {} as Record<string, boolean>)
    
    return NextResponse.json({
      tables: tableStatus,
      found: existingTables.length,
      expected: TABLES_TO_CHECK.length,
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