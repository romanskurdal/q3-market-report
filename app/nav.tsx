'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Nav() {
  const [adminMode, setAdminMode] = useState(false)

  useEffect(() => {
    // Check admin mode by trying to access admin endpoint
    fetch('/api/admin/series')
      .then(response => setAdminMode(response.ok))
      .catch(() => setAdminMode(false))
  }, [])
  
  return (
    <nav style={{
      borderBottom: '1px solid #e2e8f0',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      background: 'white'
    }}>
      {adminMode && (
        <Link 
          href="/db" 
          style={{ 
            textDecoration: 'none', 
            fontSize: '13px', 
            color: '#64748b',
            fontWeight: '500',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#475569'
            e.currentTarget.style.background = '#f1f5f9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Admin
        </Link>
      )}
    </nav>
  )
}