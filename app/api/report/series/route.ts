import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDbConnection } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const codesParam = searchParams.get('codes')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!codesParam) {
      return NextResponse.json(
        { error: 'codes parameter is required (comma-separated)' },
        { status: 400 }
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    // Parse codes and validate
    const codes = codesParam.split(',').map(c => c.trim()).filter(c => c.length > 0)
    
    if (codes.length === 0 || codes.length > 10) {
      return NextResponse.json(
        { error: 'codes must contain 1-10 series codes' },
        { status: 400 }
      )
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Dates must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    const pool = await getDbConnection()

    // Build parameterized query to fetch series data with descriptions
    // Join FinData with FinMaster to get descriptions
    // Limit to 500 rows per series to avoid huge queries
    const codeParams = codes.map((code, index) => `@code${index}`).join(',')
    
    let query = `
      SELECT TOP 2000
        fd.DATE as date,
        fd.API_CODE as code,
        fd.VALUE as value,
        fm.Description as description
      FROM FinData fd
      LEFT JOIN FinMaster fm ON fd.API_CODE = fm.APICode
      WHERE fd.API_CODE IN (${codeParams})
        AND fd.DATE >= @startDate
        AND fd.DATE <= @endDate
      ORDER BY fd.DATE ASC, fd.API_CODE
    `

    const dbRequest = pool.request()
    
    // Add code parameters
    codes.forEach((code, index) => {
      dbRequest.input(`code${index}`, sql.NVarChar, code)
    })
    
    // Add date parameters
    dbRequest.input('startDate', sql.Date, startDate)
    dbRequest.input('endDate', sql.Date, endDate)

    const result = await dbRequest.query(query)

    // Transform data for charts (grouped by code)
    const chartData: Record<string, Array<{ date: string, value: number | null }>> = {}
    const descriptions: Record<string, string> = {}
    
    // Also prepare table data (merged by date)
    const dateMap: Record<string, Record<string, number | null>> = {}
    const allDates = new Set<string>()

    result.recordset.forEach((row: any) => {
      const code = row.code || ''
      const date = row.date ? new Date(row.date).toISOString().split('T')[0] : ''
      const value = row.value !== null ? Number(row.value) : null
      
      if (!chartData[code]) {
        chartData[code] = []
        descriptions[code] = row.description || code
      }
      
      chartData[code].push({ date, value })
      
      if (!dateMap[date]) {
        dateMap[date] = {}
      }
      dateMap[date][code] = value
      allDates.add(date)
    })

    // Sort dates for table
    const sortedDates = Array.from(allDates).sort()

    // Build table data (each row has date + one column per series)
    const tableData = sortedDates.map(date => {
      const row: Record<string, string | number | null> = { date }
      codes.forEach(code => {
        row[code] = dateMap[date]?.[code] ?? null
      })
      return row
    })

    return NextResponse.json({
      codes,
      descriptions,
      chartData, // Series data grouped by code
      tableData, // Merged table data by date
      rowCount: result.recordset.length,
      dateRange: { startDate, endDate }
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