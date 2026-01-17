'use client'

import React, { useState, useEffect } from 'react'
import SectionEditor from './components/SectionEditor'
import AIAnalysisSection from './components/AIAnalysisSection'
import ReportSection from './components/ReportSection'
import Logo from './components/Logo'
import { theme } from './theme'


export default function Home() {
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  const defaultStart = oneYearAgo.toISOString().split('T')[0]
  const defaultEnd = today.toISOString().split('T')[0]

  const [activeTab, setActiveTab] = useState<'Equities' | 'Fixed Income' | 'Economic Data'>('Equities')
  const [adminMode, setAdminMode] = useState(false)
  const [sectionConfig, setSectionConfig] = useState<Record<string, string[]>>({
    'Equities': ['SP500', 'IJR', 'EFA', 'VIXCLS'],
    'Fixed Income': ['DGS2', 'DGS5', 'DGS10', 'DGS30', 'BAMLH0A0HYM2', 'BAMLC0A0CM'],
    'Economic Data': ['CPIAUCSL', 'UNRATE', 'PAYEMS', 'GDP']
  })
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    // Check admin mode
    const checkAdminMode = async () => {
      try {
        const response = await fetch('/api/admin/series')
        setAdminMode(response.ok)
      } catch {
        setAdminMode(false)
      }
    }

    checkAdminMode()
  }, [])

  useEffect(() => {
    // Load section config
    const loadConfig = async () => {
      setLoadingConfig(true)
      try {
        const response = await fetch('/api/admin/section-config')
        if (response.ok) {
          const data = await response.json()
          setSectionConfig(data.config || sectionConfig)
        }
      } catch (error) {
        console.error('Error loading config:', error)
      } finally {
        setLoadingConfig(false)
      }
    }

    loadConfig()
  }, [])

  const handleEdit = (sectionName: string) => {
    setEditingSection(sectionName)
  }

  const handleSave = (sectionName: string, codes: string[]) => {
    setSectionConfig(prev => ({
      ...prev,
      [sectionName]: codes
    }))
    setEditingSection(null)
  }

  const handleClose = () => {
    setEditingSection(null)
  }

  return (
    <div style={{ 
      padding: '24px 32px', 
      maxWidth: '1800px', 
      margin: '0 auto',
      background: theme.colors.neutral[50],
      minHeight: '100vh'
    }}>
      {/* Header with Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: `2px solid ${theme.colors.neutral[200]}`
      }}>
        <Logo />
        <div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700',
            margin: '0 0 4px 0',
            background: `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.secondary[600]} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Third Quartile Market Overview
          </h1>
          <p style={{ 
            color: theme.colors.neutral[600], 
            margin: 0,
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Market analysis and economic indicators + weekly AI commentary
          </p>
        </div>
      </div>

      {loadingConfig && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading configuration...</div>
      )}

      {!loadingConfig && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 480px',
          gap: '30px',
          alignItems: 'start'
        }}
        className="report-layout"
        >
          {/* Left Column - Sections */}
          <div>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: `2px solid ${theme.colors.neutral[200]}`,
              marginBottom: '32px',
              gap: '0',
              background: 'white',
              borderRadius: '12px 12px 0 0',
              padding: '0 8px',
              boxShadow: theme.shadows.sm
            }}>
              {(['Equities', 'Fixed Income', 'Economic Data'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: activeTab === tab ? '600' : '500',
                    border: 'none',
                    borderBottom: activeTab === tab ? `3px solid ${theme.colors.secondary[500]}` : '3px solid transparent',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: activeTab === tab ? theme.colors.secondary[600] : theme.colors.neutral[600],
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    marginBottom: '-2px'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = theme.colors.secondary[500]
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = theme.colors.neutral[600]
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'Equities' && (
              <ReportSection
                title="Equities"
                description="Stock market indices and volatility indicators"
                codes={sectionConfig['Equities'] || ['SP500', 'IJR', 'EFA', 'VIXCLS']}
                defaultStartDate={defaultStart}
                defaultEndDate={defaultEnd}
                adminMode={adminMode}
                onEdit={() => handleEdit('Equities')}
              />
            )}

            {activeTab === 'Fixed Income' && (
              <ReportSection
                title="Fixed Income"
                description="Treasury yields and corporate bond spreads"
                codes={sectionConfig['Fixed Income'] || ['DGS2', 'DGS5', 'DGS10', 'DGS30', 'BAMLH0A0HYM2', 'BAMLC0A0CM']}
                defaultStartDate={defaultStart}
                defaultEndDate={defaultEnd}
                adminMode={adminMode}
                onEdit={() => handleEdit('Fixed Income')}
              />
            )}

            {activeTab === 'Economic Data' && (
              <ReportSection
                title="Economic Data"
                description="Inflation, employment, and GDP indicators"
                codes={sectionConfig['Economic Data'] || ['CPIAUCSL', 'UNRATE', 'PAYEMS', 'GDP']}
                defaultStartDate={defaultStart}
                defaultEndDate={defaultEnd}
                adminMode={adminMode}
                onEdit={() => handleEdit('Economic Data')}
              />
            )}
          </div>

          {/* Right Column - AI Analysis */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <AIAnalysisSection />
          </div>
        </div>
      )}

      {editingSection && (
        <SectionEditor
          sectionName={editingSection}
          currentCodes={sectionConfig[editingSection] || []}
          onSave={(codes) => handleSave(editingSection, codes)}
          onClose={handleClose}
          adminMode={adminMode}
        />
      )}
    </div>
  )
}
