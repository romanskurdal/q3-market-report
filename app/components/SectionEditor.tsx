'use client'

import { useState, useEffect } from 'react'

interface Series {
  code: string
  description: string
  source: string
}

interface SectionEditorProps {
  sectionName: string
  currentCodes: string[]
  onSave: (codes: string[]) => void
  onClose: () => void
  adminMode: boolean
}

export default function SectionEditor({ sectionName, currentCodes, onSave, onClose, adminMode }: SectionEditorProps) {
  const [allSeries, setAllSeries] = useState<Series[]>([])
  const [selectedCodes, setSelectedCodes] = useState<string[]>(currentCodes)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!adminMode) return

    const fetchSeries = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/series')
        if (!response.ok) throw new Error('Failed to fetch series')
        const data = await response.json()
        setAllSeries(data.series || [])
      } catch (error) {
        console.error('Error fetching series:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [adminMode])

  const filteredSeries = allSeries.filter(series =>
    series.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    series.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const requiredCount = sectionName === 'Fixed Income' ? 6 : 4

  const toggleSeries = (code: string) => {
    setSelectedCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code)
      } else if (prev.length < requiredCount) {
        return [...prev, code]
      }
      return prev
    })
  }

  const handleSave = async () => {
    if (selectedCodes.length !== requiredCount) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/section-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName,
          seriesCodes: selectedCodes
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      onSave(selectedCodes)
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (!adminMode) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '24px' }}>
          Edit {sectionName} Section
        </h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Select exactly {sectionName === 'Fixed Income' ? '6' : '4'} series to display in this section ({selectedCodes.length}/{sectionName === 'Fixed Income' ? '6' : '4'} selected)
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by code or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />

        {/* Selected Series */}
        {selectedCodes.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Selected ({selectedCodes.length}/4):</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedCodes.map(code => {
                const series = allSeries.find(s => s.code === code)
                return (
                  <div
                    key={code}
                    onClick={() => toggleSeries(code)}
                    style={{
                      padding: '6px 12px',
                      background: '#2563eb',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {code} {series?.description ? `- ${series.description}` : ''} ×
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Available Series */}
        <div style={{ marginBottom: '20px', maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading series...</div>
          ) : (
            <div style={{ padding: '8px' }}>
              {filteredSeries.map(series => {
                const isSelected = selectedCodes.includes(series.code)
                const isDisabled = !isSelected && selectedCodes.length >= requiredCount
                
                return (
                  <div
                    key={series.code}
                    onClick={() => !isDisabled && toggleSeries(series.code)}
                    style={{
                      padding: '10px',
                      border: `1px solid ${isSelected ? '#2563eb' : '#ddd'}`,
                      borderRadius: '4px',
                      marginBottom: '8px',
                      background: isSelected ? '#eff6ff' : isDisabled ? '#f5f5f5' : 'white',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {series.code}
                      {isSelected && <span style={{ marginLeft: '8px', color: '#2563eb' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {series.description || 'No description'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedCodes.length !== requiredCount || saving}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: selectedCodes.length === requiredCount ? '#2563eb' : '#ccc',
              color: 'white',
              cursor: selectedCodes.length === requiredCount && !saving ? 'pointer' : 'not-allowed'
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}