import { NextResponse } from 'next/server'
import sql from 'mssql'
import { getDbConnection } from '@/lib/db'

const DEFAULT_CONFIG: Record<string, string[]> = {
  'Equities': ['SP500', 'IJR', 'EFA', 'VIXCLS'],
  'Fixed Income': ['DGS2', 'DGS5', 'DGS10', 'DGS30', 'BAMLH0A0HYM2', 'BAMLC0A0CM'],
  'Economic Data': ['CPIAUCSL', 'UNRATE', 'PAYEMS', 'GDP']
}

// Treasury curve series (not editable, shown at top of Fixed Income)
const TREASURY_CURVE_SERIES = ['DGS2', 'DGS5', 'DGS10', 'DGS30']

export async function GET() {
  try {
    const pool = await getDbConnection()
    
    // Check if SectionConfig table exists, if not return defaults
    try {
      const tableCheck = await pool.request().query(`
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = 'SectionConfig'
      `)
      
      if (tableCheck.recordset[0]?.count === 0) {
        return NextResponse.json({
          config: DEFAULT_CONFIG,
          source: 'default'
        })
      }
      
      // Get saved config
      const result = await pool.request().query(`
        SELECT SectionName, SeriesCodes
        FROM SectionConfig
      `)
      
      // Parse config from database
      const config: Record<string, string[]> = {}
      result.recordset.forEach((row: any) => {
        const codes = row.SeriesCodes ? JSON.parse(row.SeriesCodes) : []
        config[row.SectionName] = codes
      })
      
      // Merge with defaults for any missing sections
      Object.keys(DEFAULT_CONFIG).forEach(section => {
        if (!config[section]) {
          config[section] = DEFAULT_CONFIG[section]
        }
      })
      
      return NextResponse.json({
        config,
        source: 'database'
      })
    } catch (err) {
      // Table doesn't exist, return defaults
      return NextResponse.json({
        config: DEFAULT_CONFIG,
        source: 'default'
      })
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check if admin mode is enabled
    const adminMode = process.env.ADMIN_MODE === 'true'
    if (!adminMode) {
      return NextResponse.json(
        { error: 'Access restricted' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { sectionName, seriesCodes } = body

    // Validate series count based on section
    const requiredCount = sectionName === 'Fixed Income' ? 6 : 4
    if (!sectionName || !Array.isArray(seriesCodes) || seriesCodes.length !== requiredCount) {
      return NextResponse.json(
        { error: `sectionName and seriesCodes (exactly ${requiredCount}) are required` },
        { status: 400 }
      )
    }

    const pool = await getDbConnection()
    
    // Create table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SectionConfig')
      CREATE TABLE SectionConfig (
        SectionName NVARCHAR(255) PRIMARY KEY,
        SeriesCodes NVARCHAR(MAX) NOT NULL,
        UpdatedAt DATETIME DEFAULT GETDATE()
      )
    `)
    
    // Upsert config
    await pool.request()
      .input('sectionName', sql.NVarChar, sectionName)
      .input('seriesCodes', sql.NVarChar, JSON.stringify(seriesCodes))
      .query(`
        MERGE SectionConfig AS target
        USING (SELECT @sectionName AS SectionName) AS source
        ON target.SectionName = source.SectionName
        WHEN MATCHED THEN
          UPDATE SET SeriesCodes = @seriesCodes, UpdatedAt = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (SectionName, SeriesCodes) VALUES (@sectionName, @seriesCodes);
      `)
    
    return NextResponse.json({
      success: true,
      sectionName,
      seriesCodes
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