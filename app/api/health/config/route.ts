import { NextResponse } from 'next/server'

export async function GET() {
  // Debug endpoint to verify env variables are loaded (without exposing secrets)
  const config = {
    server: process.env.DB_SERVER ? `${process.env.DB_SERVER.substring(0, 10)}...` : 'MISSING',
    database: process.env.DB_DATABASE || 'MISSING',
    user: process.env.DB_USER || 'MISSING',
    passwordLength: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0,
    hasPassword: !!process.env.DB_PASSWORD,
    // Check for common issues
    serverHasTrailingSpace: process.env.DB_SERVER?.endsWith(' ') || process.env.DB_SERVER?.startsWith(' '),
    userHasTrailingSpace: process.env.DB_USER?.endsWith(' ') || process.env.DB_USER?.startsWith(' '),
    passwordHasTrailingSpace: process.env.DB_PASSWORD?.endsWith(' ') || process.env.DB_PASSWORD?.startsWith(' '),
  }
  
  return NextResponse.json(config)
}