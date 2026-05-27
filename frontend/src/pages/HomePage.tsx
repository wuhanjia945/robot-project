import React, { useState, useEffect } from 'react'

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [basics, setBasics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/market/basics')
      .then(res => res.json())
      .then(data => setBasics(data))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div style={{
        textAlign: 'center', padding: '60px 0 48px',
        borderBottom: '1px solid var(--border-subtle)', marginBottom: 48,
      }}>
        <div style={{
          fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase',
        }}>Open Source Robot Development Platform</div>
        <h1 style={{
          fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em',
          lineHeight: 1.1, marginBottom: 20,
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>让每个人都能<br/>手搓一台机器人</h1>
        <p style={{
          fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560,
          margin: '0 auto 36px', lineHeight: 1.7,
        }}>
          从零基础到部署上线的全流程指导，主流方案参考 + 智能需求分析 + 配套算法适配 + 完整BOM清单
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => onNavigate('requirement')} style={{
            padding: '14px 32px', background: 'var(--accent)', color: '#060810',
            border: 'none', borderRadius: 'var(--radius-md)', fontSize: 15,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
            boxShadow: '0 0 30px rgba(0,229,195,0.2)',
          }}>开始设计我的机器人</button>
          <button onClick={() => onNavigate('market')} style={{
            padding: '14px 32px', background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
            fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>浏览市场方案</button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 56,
      }}>
        {[
          { num: '01', title: '了解机器人', desc: '零基础入门，从概念到实践，了解机器人发展史和核心技术', action: 'market' },
          { num: '02', title: '描述需求', desc: '智能问答采集需求，实时矛盾检测，确保方案可行', action: 'requirement' },
          { num: '03', title: '获取方案', desc: '自动生成技术架构、BOM清单、算法选型和部署方案', action: 'solution' },
        ].map((step, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '32px 28px',
            backdropFilter: 'blur(12px)', cursor: 'pointer',
            transition: 'all var(--transition-normal)',
          }} onClick={() => onNavigate(step.action)}>
            <div style={{
              fontSize: 36, fontWeight: 700, color: 'var(--accent)',
              fontFamily: 'var(--font-mono)', marginBottom: 16, opacity: 0.6,
            }}>{step.num}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {basics && (
        <div style={{ marginBottom: 56 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', marginBottom: 24,
          }}>CORE CONCEPTS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {(basics.core_concepts || []).map((c: any, i: number) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '24px',
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, marginBottom: 14,
                }}>
                  {c.icon === 'eye' ? '◉' : c.icon === 'brain' ? '◈' : c.icon === 'hand' ? '◎' : '⬡'}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{c.name}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '40px 48px',
        backdropFilter: 'blur(12px)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--yellow)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 16 }}>
          OPEN SOURCE
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>开源项目，共建生态</h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.7 }}>
          本项目完全开源，欢迎贡献代码、提交方案、分享你的机器人项目
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="https://github.com" target="_blank" style={{
            padding: '12px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14,
            fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-display)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>⌘ GitHub</a>
          <a href="https://github.com" target="_blank" style={{
            padding: '12px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14,
            fontWeight: 500, textDecoration: 'none', fontFamily: 'var(--font-display)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>⬡ 贡献指南</a>
        </div>
      </div>
    </div>
  )
}

export default HomePage
