import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({ children, className = '', style = {}, padding = 'md', hover = false }: CardProps) {
  const paddingMap = {
    sm: '12px',
    md: '20px',
    lg: '24px',
  }

  return (
    <div
      className={className}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: paddingMap[padding],
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e2e8f0',
        transition: hover ? 'all 0.2s ease' : 'none',
        ...(hover && {
          ':hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }
        }),
        ...style
      }}
    >
      {children}
    </div>
  )
}