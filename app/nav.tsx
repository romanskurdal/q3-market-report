'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Nav() {
  const [adminMode, setAdminMode] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Check admin mode by trying to access admin endpoint
    fetch('/api/admin/series')
      .then(response => setAdminMode(response.ok))
      .catch(() => setAdminMode(false))
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    
    // Clear all caches
    try {
      localStorage.removeItem('treasury_curve_data')
      localStorage.removeItem('treasury_curve_processed')
      // Add other cache keys here if needed in the future
    } catch (e) {
      console.warn('Failed to clear cache:', e)
    }
    
    // Dispatch custom event to trigger refresh in components
    window.dispatchEvent(new CustomEvent('dataRefresh'))
    
    // Reload the page after a short delay to ensure cache is cleared
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
  
  return (
    <nav style={{
      borderBottom: '1px solid #e2e8f0',
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '12px',
      background: 'white'
    }}>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        style={{ 
          fontSize: '13px', 
          color: '#64748b',
          fontWeight: '500',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: 'white',
          cursor: refreshing ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onMouseEnter={(e) => {
          if (!refreshing) {
            e.currentTarget.style.color = '#475569'
            e.currentTarget.style.background = '#f1f5f9'
            e.currentTarget.style.borderColor = '#94a3b8'
          }
        }}
        onMouseLeave={(e) => {
          if (!refreshing) {
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }
        }}
      >
        {refreshing ? (
          <>
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <span>🔄</span>
            <span>Refresh Data</span>
          </>
        )}
      </button>
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