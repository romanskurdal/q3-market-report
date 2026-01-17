import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDbConnection } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    
    const pool = await getDbConnection()
    
    // Build query with optional folder filter
    let query = `
      SELECT TOP 26
        pa.ID,
        pa.START_DATE,
        pa.END_DATE,
        pa.CREATED_AT,
        pa.FOLDER_ID,
        f.name as FolderName,
        CASE 
          WHEN pa.END_DATE IS NOT NULL THEN pa.END_DATE
          WHEN pa.CREATED_AT IS NOT NULL THEN CAST(pa.CREATED_AT AS DATE)
          ELSE NULL
        END as LabelDate
      FROM PdfAnalysis pa
      LEFT JOIN Folders f ON pa.FOLDER_ID = f.id
    `
    
    if (folderId) {
      query += ` WHERE pa.FOLDER_ID = @folderId`
    }
    
    query += `
      ORDER BY 
        CASE 
          WHEN pa.END_DATE IS NOT NULL THEN pa.END_DATE
          WHEN pa.CREATED_AT IS NOT NULL THEN CAST(pa.CREATED_AT AS DATE)
          ELSE CAST('1900-01-01' AS DATE)
        END DESC,
        pa.ID DESC
    `
    
    const dbRequest = pool.request()
    if (folderId) {
      dbRequest.input('folderId', sql.NVarChar, folderId)
    }
    
    const result = await dbRequest.query(query)
    
    const entries = result.recordset.map((row: any) => {
      let label = `Analysis #${row.ID}`
      if (row.LabelDate) {
        const date = new Date(row.LabelDate)
        label = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      }
      
      // Include folder name in label if available
      if (row.FolderName) {
        label = `${row.FolderName} - ${label}`
      }
      
      return {
        id: row.ID,
        label,
        folderId: row.FOLDER_ID || null,
        folderName: row.FolderName || null,
        startDate: row.START_DATE ? new Date(row.START_DATE).toISOString().split('T')[0] : null,
        endDate: row.END_DATE ? new Date(row.END_DATE).toISOString().split('T')[0] : null,
        createdAt: row.CREATED_AT ? new Date(row.CREATED_AT).toISOString() : null
      }
    })
    
    return NextResponse.json({
      count: entries.length,
      entries
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