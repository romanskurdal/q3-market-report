'use client'

import { useState, useEffect } from 'react'
import { theme } from '../theme'

interface AnalysisEntry {
  id: number
  label: string
  folderId: string | null
  folderName: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string | null
}

interface AnalysisDetail {
  id: number
  macroUS: string
  equities: string
  fixedIncome: string
  otherAssets: string
  startDate: string | null
  endDate: string | null
  createdAt: string | null
}

interface Folder {
  id: string
  name: string
  count: number
}

export default function AIAnalysisSection() {
  const [entries, setEntries] = useState<AnalysisEntry[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null)
  const [activeTab, setActiveTab] = useState<'macro' | 'equities' | 'fixedIncome' | 'otherAssets'>('macro')
  const [loading, setLoading] = useState(false)
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFolders = async () => {
      setLoadingFolders(true)
      try {
        const response = await fetch('/api/report/ai-analysis/folders')
        if (response.ok) {
          const data = await response.json()
          setFolders(data.folders || [])
        }
      } catch (err) {
        console.error('Error fetching folders:', err)
      } finally {
        setLoadingFolders(false)
      }
    }

    fetchFolders()
  }, [])

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = selectedFolderId 
          ? `/api/report/ai-analysis/list?folderId=${encodeURIComponent(selectedFolderId)}`
          : '/api/report/ai-analysis/list'
        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch entries')
        }
        const data = await response.json()
        setEntries(data.entries || [])
        // Auto-select the first entry
        if (data.entries && data.entries.length > 0) {
          setSelectedId(data.entries[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [selectedFolderId])

  useEffect(() => {
    if (!selectedId) return

    const fetchAnalysis = async () => {
      setLoadingDetail(true)
      setError(null)
      try {
        const response = await fetch(`/api/report/ai-analysis/${selectedId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch analysis')
        }
        const data = await response.json()
        setAnalysis(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setAnalysis(null)
      } finally {
        setLoadingDetail(false)
      }
    }

    fetchAnalysis()
  }, [selectedId])

  const tabs = [
    { id: 'macro' as const, label: 'Macro (US)' },
    { id: 'equities' as const, label: 'Equities' },
    { id: 'fixedIncome' as const, label: 'Fixed Income' },
    { id: 'otherAssets' as const, label: 'Other Assets' }
  ]

  const getTabContent = () => {
    if (!analysis) return null
    switch (activeTab) {
      case 'macro':
        return analysis.macroUS || <span style={{ color: theme.colors.neutral[400] }}>No content available</span>
      case 'equities':
        return analysis.equities || <span style={{ color: theme.colors.neutral[400] }}>No content available</span>
      case 'fixedIncome':
        return analysis.fixedIncome || <span style={{ color: theme.colors.neutral[400] }}>No content available</span>
      case 'otherAssets':
        return analysis.otherAssets || <span style={{ color: theme.colors.neutral[400] }}>No content available</span>
    }
  }

  return (
    <section style={{
      marginBottom: '20px',
      padding: '24px',
      border: `1px solid ${theme.colors.neutral[200]}`,
      borderRadius: '12px',
      background: 'white',
      boxShadow: theme.shadows.md
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '8px',
        color: theme.colors.neutral[900]
      }}>
        AI Analysis
      </h2>
      <p style={{
        color: theme.colors.neutral[600],
        marginBottom: '24px',
        fontSize: '14px'
      }}>
        AI-generated market analysis from PDF sources
      </p>

      {loading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.colors.neutral[600],
          background: theme.colors.neutral[50],
          borderRadius: '8px'
        }}>
          Loading...
        </div>
      )}
      
      {error && (
        <div style={{
          padding: '16px',
          background: '#fef2f2',
          color: theme.colors.error,
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid #fecaca`
        }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          {/* Folder Filter */}
          {folders.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Filter by Newsletter:
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => {
                  setSelectedFolderId(e.target.value)
                  setSelectedId(null) // Reset selection when folder changes
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: `1px solid ${theme.colors.neutral[300]}`,
                  borderRadius: '8px',
                  background: 'white',
                  color: theme.colors.neutral[900],
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.secondary[500]
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.secondary[100]}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.neutral[300]
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">All Newsletters</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name} ({folder.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Entry Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Select Analysis:
            </label>
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: `1px solid ${theme.colors.neutral[300]}`,
                borderRadius: '8px',
                background: 'white',
                color: theme.colors.neutral[900],
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.secondary[500]
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.secondary[100]}`
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.neutral[300]
                e.target.style.boxShadow = 'none'
              }}
            >
              {entries.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>

          {/* Analysis Content */}
          {loadingDetail && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading analysis...</div>
          )}

          {!loadingDetail && analysis && (
            <div style={{ marginTop: '20px' }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                marginBottom: '20px',
                gap: '0'
              }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: activeTab === tab.id ? '600' : '500',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? `3px solid ${theme.colors.secondary[500]}` : '3px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: activeTab === tab.id ? theme.colors.secondary[600] : theme.colors.neutral[600],
                      transition: 'all 0.2s ease',
                      marginBottom: '-2px'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = theme.colors.secondary[500]
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = theme.colors.neutral[600]
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{
                padding: '20px',
                background: theme.colors.neutral[50],
                borderRadius: '8px',
                border: `1px solid ${theme.colors.neutral[200]}`,
                minHeight: '300px',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: theme.colors.neutral[800],
                  whiteSpace: 'pre-wrap'
                }}>
                  {getTabContent()}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !error && entries.length === 0 && (
        <p style={{ padding: '20px', color: '#666' }}>No AI analysis entries available.</p>
      )}
    </section>
  )
}