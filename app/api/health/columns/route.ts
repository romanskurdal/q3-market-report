import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

const TABLES = ['FinMaster', 'FinData', 'AIWeeklySummary']

export async function GET() {
  try {
    const pool = await getDbConnection()
    const tableList = TABLES.map(name => `'${name}'`).join(',')
    
    const result = await pool.request().query(`
      SELECT 
        TABLE_NAME as tableName,
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME IN (${tableList})
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `)
    
    // Group by table
    const columnsByTable = result.recordset.reduce((acc: any, row: any) => {
      const tableName = row.tableName
      if (!acc[tableName]) {
        acc[tableName] = []
      }
      acc[tableName].push({
        name: row.columnName,
        type: row.dataType
      })
      return acc
    }, {})
    
    return NextResponse.json({
      tables: columnsByTable
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