'use client'

import React from 'react'
import Image from 'next/image'

export default function Logo() {
  return (
    <Image
      src="/Third-Quartile-icon-2.png"
      alt="Third Quartile Logo"
      width={60}
      height={60}
      style={{ 
        borderRadius: '12px',
        objectFit: 'contain'
      }}
    />
  )
}