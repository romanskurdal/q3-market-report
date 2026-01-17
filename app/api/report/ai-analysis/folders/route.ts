import { NextResponse } from 'next/server'
import { getDbConnection } from '@/lib/db'

export async function GET() {
  try {
    const pool = await getDbConnection()
    
    // Get all folders that have PDFAnalysis entries
    const result = await pool.request().query(`
      SELECT DISTINCT
        f.id,
        f.name,
        COUNT(pa.ID) as AnalysisCount
      FROM Folders f
      INNER JOIN PdfAnalysis pa ON f.id = pa.FOLDER_ID
      GROUP BY f.id, f.name
      ORDER BY f.name
    `)
    
    return NextResponse.json({
      count: result.recordset.length,
      folders: result.recordset.map((row: any) => ({
        id: row.id,
        name: row.name,
        count: row.AnalysisCount
      }))
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