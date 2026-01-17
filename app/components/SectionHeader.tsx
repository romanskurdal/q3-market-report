'use client'

import React from 'react'

interface SectionHeaderProps {
  title: string
  description: string
  onEdit?: () => void
  showEdit?: boolean
}

export default function SectionHeader({ title, description, onEdit, showEdit = false }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      gap: '16px'
    }}>
      <div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#0f172a',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          margin: 0,
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      </div>
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            background: 'white',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.borderColor = '#94a3b8'
            e.currentTarget.style.color = '#334155'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#cbd5e1'
            e.currentTarget.style.color = '#475569'
          }}
        >
          Edit
        </button>
      )}
    </div>
  )
}