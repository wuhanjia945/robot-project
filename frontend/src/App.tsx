import React, { useState } from 'react'
import HomePage from './pages/HomePage'
import RequirementPage from './pages/RequirementPage'
import SolutionPage from './pages/SolutionPage'
import AlgorithmPage from './pages/AlgorithmPage'
import HardwarePage from './pages/HardwarePage'
import MarketPage from './pages/MarketPage'
import SimulationPage from './pages/SimulationPage'
import FeedbackPage from './pages/FeedbackPage'
import './index.css'

type Page = 'home' | 'market' | 'requirement' | 'solution' | 'algorithm' | 'hardware' | 'simulation' | 'feedback'

const navConfig: { key: Page; label: string; icon: string }[] = [
  { key: 'home', label: '首页', icon: '⬡' },
  { key: 'market', label: '市场方案', icon: '◉' },
  { key: 'requirement', label: '需求采集', icon: '◎' },
  { key: 'solution', label: '方案生成', icon: '◈' },
  { key: 'algorithm', label: '算法供给', icon: '⬡' },
  { key: 'hardware', label: '硬件方案', icon: '⬢' },
  { key: 'simulation', label: '仿真学习', icon: '◇' },
  { key: 'feedback', label: '反馈', icon: '✦' },
]

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(6, 8, 16, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setCurrentPage('home')}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent), #00b89c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#060810',
                boxShadow: '0 0 20px rgba(0, 229, 195, 0.25)',
              }}>R</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>RoboVision</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Motion System v1.0</div>
              </div>
            </div>
            <nav style={{ display: 'flex', gap: 2 }}>
              {navConfig.map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  style={{
                    padding: '8px 16px', border: 'none',
                    background: currentPage === item.key ? 'var(--accent-dim)' : 'transparent',
                    color: currentPage === item.key ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 13,
                    fontWeight: currentPage === item.key ? 600 : 400,
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-display)',
                  }}
                  onMouseEnter={e => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (currentPage !== item.key) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <span style={{ fontSize: 12, opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}></span>
              Online
            </div>
          </div>
        </div>
      </div>

      <main style={{ paddingTop: 88, paddingBottom: 60, maxWidth: 1440, margin: '0 auto', padding: '88px 40px 60px' }}>
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {currentPage === 'home' && <HomePage onNavigate={(p) => setCurrentPage(p as Page)} />}
          {currentPage === 'market' && <MarketPage />}
          {currentPage === 'requirement' && <RequirementPage />}
          {currentPage === 'solution' && <SolutionPage />}
          {currentPage === 'algorithm' && <AlgorithmPage />}
          {currentPage === 'hardware' && <HardwarePage />}
          {currentPage === 'simulation' && <SimulationPage />}
          {currentPage === 'feedback' && <FeedbackPage />}
        </div>
      </main>
    </div>
  )
}

export default App
