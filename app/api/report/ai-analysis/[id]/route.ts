import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDbConnection } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      )
    }

    const pool = await getDbConnection()
    
    // Get single PDFAnalysis record by ID
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query(`
        SELECT 
          ID,
          MACRO_US,
          EQUITIES,
          FIXED_INCOME,
          OTHER_ASSETS,
          START_DATE,
          END_DATE,
          CREATED_AT
        FROM PdfAnalysis
        WHERE ID = @id
      `)
    
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }
    
    const row = result.recordset[0]
    
    return NextResponse.json({
      id: row.ID,
      macroUS: row.MACRO_US || '',
      equities: row.EQUITIES || '',
      fixedIncome: row.FIXED_INCOME || '',
      otherAssets: row.OTHER_ASSETS || '',
      startDate: row.START_DATE ? new Date(row.START_DATE).toISOString().split('T')[0] : null,
      endDate: row.END_DATE ? new Date(row.END_DATE).toISOString().split('T')[0] : null,
      createdAt: row.CREATED_AT ? new Date(row.CREATED_AT).toISOString() : null
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