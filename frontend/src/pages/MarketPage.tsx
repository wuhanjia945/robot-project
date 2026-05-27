import React, { useState, useEffect } from 'react'

const MarketPage: React.FC = () => {
  const [robots, setRobots] = useState<any[]>([])
  const [basics, setBasics] = useState<any>(null)
  const [selectedRobot, setSelectedRobot] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showBasics, setShowBasics] = useState(false)
  const [frontierTech, setFrontierTech] = useState<any[]>([])
  const [showFrontier, setShowFrontier] = useState(false)

  useEffect(() => {
    fetch('/api/market/robots').then(r => r.json()).then(d => setRobots(d.robots || [])).catch(() => {})
    fetch('/api/market/basics').then(r => r.json()).then(d => setBasics(d)).catch(() => {})
    fetch('/api/market/frontier').then(r => r.json()).then(d => setFrontierTech(d.frontier_tech || [])).catch(() => {})
  }, [])

  const categories = ['all', ...new Set(robots.map(r => r.category))]
  const filteredRobots = activeCategory === 'all' ? robots : robots.filter(r => r.category === activeCategory)

  const categoryLabels: Record<string, string> = {
    all: '全部', '家用服务': '家用服务', '户外服务': '户外服务',
    '商用服务': '商用服务', '工业物流': '工业物流', '末端配送': '末端配送',
    '仿生机器人': '仿生机器人', '工业操作': '工业操作', '航空机器人': '航空机器人',
    '前沿方案': '前沿方案',
  }

  const feasibilityColors: Record<string, { color: string; bg: string }> = {
    '中等': { color: 'var(--green)', bg: 'var(--green-dim)' },
    '中高': { color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
    '高': { color: 'var(--orange)', bg: 'var(--orange-dim)' },
    '很高': { color: 'var(--red)', bg: 'var(--red-dim)' },
  }

  const safeJoin = (val: any, sep: string = '、'): string => {
    if (!val) return ''
    if (Array.isArray(val)) return val.join(sep)
    return String(val)
  }

  const sectionTitle = (label: string, color: string = 'var(--accent)') => (
    <div style={{ fontSize: 12, fontWeight: 600, color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 16 }}>
      {label}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>机器人市场方案</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 700, lineHeight: 1.7 }}>
          了解市场上主流机器人的技术栈和开发方案，点击查看详细技术框架+BOM+实现路径
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => { if(selectedRobot) setSelectedRobot(null); setShowBasics(!showBasics) }} style={{
          padding: '8px 18px', borderRadius: 'var(--radius-sm)',
          border: showBasics ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
          background: showBasics ? 'var(--accent-dim)' : 'transparent',
          color: showBasics ? 'var(--accent)' : 'var(--text-secondary)',
          cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)',
        }}>◉ 入门知识</button>
        <button onClick={() => { if(selectedRobot) setSelectedRobot(null); setShowFrontier(!showFrontier) }} style={{
          padding: '8px 18px', borderRadius: 'var(--radius-sm)',
          border: showFrontier ? '1px solid var(--orange)' : '1px solid var(--border-subtle)',
          background: showFrontier ? 'var(--orange-dim)' : 'transparent',
          color: showFrontier ? 'var(--orange)' : 'var(--text-secondary)',
          cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)',
        }}>◆ 前沿技术</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => { if(selectedRobot) setSelectedRobot(null); setActiveCategory(cat) }} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm)',
            border: activeCategory === cat ? '1px solid var(--blue)' : '1px solid var(--border-subtle)',
            background: activeCategory === cat ? 'var(--blue-dim)' : 'transparent',
            color: activeCategory === cat ? 'var(--blue)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)',
          }}>{categoryLabels[cat] || cat}</button>
        ))}
      </div>

      {showBasics && basics && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 28,
          backdropFilter: 'blur(12px)', animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 16 }}>{basics.intro?.title}</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>{basics.intro?.content}</p>
          {sectionTitle('DEVELOPMENT TIMELINE', 'var(--yellow)')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginBottom: 24 }}>
            {(basics.history || []).slice(-6).map((h: any, i: number) => (
              <div key={i} style={{
                padding: '10px 14px', background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--yellow)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)', marginRight: 8 }}>{h.year}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{h.event}</span>
              </div>
            ))}
          </div>
          {sectionTitle('TECH FRAMEWORKS', 'var(--blue)')}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {(basics.tech_frameworks || []).map((fw: any, i: number) => (
              <div key={i} style={{
                padding: '14px 16px', background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{fw.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{fw.why_important}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFrontier && frontierTech.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 28,
          backdropFilter: 'blur(12px)', animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)', marginBottom: 8 }}>前沿技术指导 Frontier Technology</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>从入门到前沿，掌握机器人领域最新技术趋势</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {frontierTech.map((tech: any, i: number) => (
              <div key={i} style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                borderLeft: '3px solid var(--orange)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{tech.name}</span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--orange-dim)', color: 'var(--orange)',
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  }}>{tech.level}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{tech.description}</div>
                {tech.key_concepts && tech.key_concepts.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--orange)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.04em' }}>CORE CONCEPTS</div>
                    {tech.key_concepts.map((c: string, j: number) => (
                      <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 8 }}>
                        <span style={{ color: 'var(--orange)', marginRight: 6 }}>●</span>{c}
                      </div>
                    ))}
                  </div>
                )}
                {tech.representative_works && tech.representative_works.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--orange)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.04em' }}>KEY WORKS</div>
                    {tech.representative_works.map((w: any, j: number) => (
                      <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 8 }}>
                        <span style={{ color: 'var(--orange)', marginRight: 6 }}>▸</span>{typeof w === 'string' ? w : w.title || w.name || JSON.stringify(w)}
                      </div>
                    ))}
                  </div>
                )}
                {tech.learning_path && tech.learning_path.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--orange)', fontFamily: 'var(--font-mono)', marginBottom: 6, letterSpacing: '0.04em' }}>LEARNING PATH</div>
                    {tech.learning_path.map((step: any, j: number) => (
                      <div key={j} style={{
                        display: 'flex', gap: 10, padding: '6px 0',
                        borderLeft: '2px solid rgba(255,107,53,0.2)', paddingLeft: 12,
                        marginLeft: 4,
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6,
                          background: 'var(--orange-dim)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: 'var(--orange)',
                          fontFamily: 'var(--font-mono)', flexShrink: 0,
                        }}>{j + 1}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {typeof step === 'string' ? step : step.title || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRobot ? (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <button onClick={() => setSelectedRobot(null)} style={{
            padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: 13, marginBottom: 20, fontFamily: 'var(--font-display)',
          }}>← 返回列表</button>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: 36, backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{selectedRobot.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{selectedRobot.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>DIY难度</div>
                <span style={{
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                  background: (feasibilityColors[selectedRobot.diy_feasibility?.level] || feasibilityColors['中等']).bg,
                  color: (feasibilityColors[selectedRobot.diy_feasibility?.level] || feasibilityColors['中等']).color,
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                }}>{selectedRobot.diy_feasibility?.level}</span>
              </div>
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{selectedRobot.description}</p>

            {selectedRobot.key_brands && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {selectedRobot.key_brands.map((brand: string, j: number) => (
                  <span key={j} style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)',
                    color: 'var(--orange)', fontSize: 12, fontWeight: 500,
                  }}>{brand}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>市场规模</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedRobot.market_size}</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>价格区间</div>
                <div style={{ fontSize: 14, color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}>{selectedRobot.price_range}</div>
              </div>
            </div>

            {selectedRobot.tech_framework && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('TECH FRAMEWORK 技术框架', 'var(--accent)')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {Object.entries(selectedRobot.tech_framework).map(([key, val]: [string, any]) => (
                    <div key={key} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{key}</div>
                      {typeof val === 'string' ? (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{val}</div>
                      ) : Array.isArray(val) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {val.map((v: string, j: number) => (
                            <span key={j} style={{ padding: '2px 8px', background: 'var(--accent-dim)', borderRadius: 4, fontSize: 11, color: 'var(--accent)' }}>{v}</span>
                          ))}
                        </div>
                      ) : typeof val === 'object' && val !== null ? (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                          {Object.entries(val).map(([k, v]: [string, any]) => (
                            <div key={k} style={{ marginBottom: 4 }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginRight: 6 }}>{k}:</span>
                              {Array.isArray(v) ? v.join('、') : String(v)}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRobot.tech_stack && !selectedRobot.tech_framework && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('TECH STACK', 'var(--accent)')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {Object.entries(selectedRobot.tech_stack).map(([key, vals]: [string, any]) => (
                    <div key={key} style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase' }}>{key}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(Array.isArray(vals) ? vals : []).map((v: string, j: number) => (
                          <span key={j} style={{ padding: '2px 8px', background: 'var(--accent-dim)', borderRadius: 4, fontSize: 11, color: 'var(--accent)' }}>{v}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRobot.detailed_bom && selectedRobot.detailed_bom.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('BOM LIST 物料清单 (DIY最低 ¥' + (selectedRobot.diy_feasibility?.min_budget || '?') + ')', 'var(--orange)')}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,107,53,0.08)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)' }}>物料</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)', width: 50 }}>数量</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)', width: 80 }}>单价(¥)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)', width: 80 }}>小计(¥)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)' }}>规格</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--orange)', fontSize: 11, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-subtle)', width: 70 }}>来源</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRobot.detailed_bom.map((item: any, j: number) => (
                        <tr key={j} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>{item.item}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.quantity}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.price}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--orange)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.price * item.quantity}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 11 }}>{item.specs || '-'}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 11 }}>{item.source || '-'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'rgba(255,107,53,0.05)' }}>
                        <td colSpan={3} style={{ padding: '10px 14px', color: 'var(--orange)', fontWeight: 600 }}>合计</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--orange)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15 }}>
                          ¥{selectedRobot.detailed_bom.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedRobot.implementation_path && selectedRobot.implementation_path.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('IMPLEMENTATION PATH 实现路径', 'var(--yellow)')}
                {selectedRobot.implementation_path.map((phase: any, pi: number) => (
                  <div key={pi} style={{ marginBottom: pi < selectedRobot.implementation_path.length - 1 ? 20 : 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--yellow)',
                      marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--yellow-dim)', border: '1px solid rgba(255,192,72,0.2)',
                        fontSize: 12, fontFamily: 'var(--font-mono)',
                      }}>PHASE {pi + 1}</span>
                      {phase.phase}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 12 }}>
                      {phase.steps && phase.steps.map((step: any, si: number) => (
                        <div key={si} style={{
                          padding: '12px 16px', background: 'rgba(0,0,0,0.15)',
                          borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--yellow)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{step.action}</div>
                            {step.time && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{step.time}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.detail}</div>
                          {step.code && (
                            <div style={{
                              marginTop: 8, padding: '10px 14px',
                              background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)',
                              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)',
                              lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap',
                            }}>{step.code}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!selectedRobot.implementation_path && selectedRobot.learning_path && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('LEARNING PATH (最低 ¥' + (selectedRobot.diy_feasibility?.min_budget || '?') + ')', 'var(--yellow)')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedRobot.learning_path.map((step: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex', gap: 14, padding: '14px 18px',
                      background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--yellow)',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'var(--yellow-dim)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: 'var(--yellow)',
                        fontFamily: 'var(--font-mono)', flexShrink: 0,
                      }}>{step.step}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRobot.summary && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('SUMMARY 方案摘要', 'var(--accent)')}
                <div style={{
                  padding: 20, background: 'rgba(0,229,195,0.05)',
                  border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)',
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}>{selectedRobot.summary}</div>
              </div>
            )}

            {selectedRobot.resource_links && selectedRobot.resource_links.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('RESOURCES 资源链接', 'var(--blue)')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {selectedRobot.resource_links.map((res: any, j: number) => (
                    <a key={j} href={res.url} target="_blank" rel="noopener noreferrer" style={{
                      padding: '14px 18px', background: 'rgba(0,0,0,0.2)',
                      borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue)',
                      textDecoration: 'none', display: 'block',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>{res.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          padding: '1px 6px', borderRadius: 3,
                          background: 'var(--blue-dim)', color: 'var(--blue)',
                          fontSize: 10, fontFamily: 'var(--font-mono)',
                        }}>{res.type}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.url}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedRobot.open_source && selectedRobot.open_source.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('OPEN SOURCE 开源项目', 'var(--accent)')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {selectedRobot.open_source.map((proj: any, j: number) => (
                    <a key={j} href={proj.url} target="_blank" rel="noopener noreferrer" style={{
                      padding: '16px 20px', background: 'rgba(0,0,0,0.2)',
                      borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)',
                      textDecoration: 'none', display: 'block',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>{proj.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{proj.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{proj.url}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedRobot.attachments && (
              <div style={{ marginBottom: 28 }}>
                {sectionTitle('ATTACHMENTS 配套资料', 'var(--blue)')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {selectedRobot.attachments.tutorial && (
                    <div style={{
                      padding: 20, background: 'rgba(0,0,0,0.2)',
                      borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--blue)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>📄</span>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedRobot.attachments.tutorial.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{selectedRobot.attachments.tutorial.description}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedRobot.attachments.tutorial.format && (
                          <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--blue-dim)', color: 'var(--blue)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{selectedRobot.attachments.tutorial.format}</span>
                        )}
                        {selectedRobot.attachments.tutorial.status && (
                          <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,192,72,0.1)', color: 'var(--yellow)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{selectedRobot.attachments.tutorial.status}</span>
                        )}
                      </div>
                      {selectedRobot.attachments.tutorial.url && (
                        <a href={selectedRobot.attachments.tutorial.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--blue)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>查看教程 →</a>
                      )}
                    </div>
                  )}
                  {selectedRobot.attachments.source_code && (
                    <div style={{
                      padding: 20, background: 'rgba(0,0,0,0.2)',
                      borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--green)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>💻</span>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedRobot.attachments.source_code.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{selectedRobot.attachments.source_code.description}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedRobot.attachments.source_code.language && (
                          <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--green-dim)', color: 'var(--green)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{selectedRobot.attachments.source_code.language}</span>
                        )}
                        {selectedRobot.attachments.source_code.framework && (
                          <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{selectedRobot.attachments.source_code.framework}</span>
                        )}
                      </div>
                      {selectedRobot.attachments.source_code.url && (
                        <a href={selectedRobot.attachments.source_code.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>获取源代码 →</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ padding: 20, background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>推荐技术栈</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                {selectedRobot.recommended_stack?.sensors && <div>感知：{safeJoin(selectedRobot.recommended_stack.sensors)}</div>}
                {selectedRobot.recommended_stack?.controller && <div>计算：{safeJoin(selectedRobot.recommended_stack.controller)}</div>}
                {selectedRobot.recommended_stack?.compute && <div>计算：{safeJoin(selectedRobot.recommended_stack.compute)}</div>}
                {(selectedRobot.recommended_stack?.actuators || selectedRobot.recommended_stack?.motors) && <div>驱动：{safeJoin(selectedRobot.recommended_stack?.actuators || selectedRobot.recommended_stack?.motors)}</div>}
                {selectedRobot.recommended_stack?.framework && <div>框架：{selectedRobot.recommended_stack.framework}</div>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filteredRobots.map((robot, i) => {
            const fc = feasibilityColors[robot.diy_feasibility?.level] || feasibilityColors['中等']
            return (
              <div key={i} onClick={() => setSelectedRobot(robot)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '24px 28px',
                backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
                cursor: 'pointer', transition: 'all var(--transition-normal)',
                animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>{robot.name}</h3>
                  <span style={{
                    padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                    background: fc.bg, color: fc.color, fontSize: 11, fontWeight: 600,
                    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                  }}>{robot.diy_feasibility?.level}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{robot.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}>{robot.price_range}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    DIY ¥{robot.diy_feasibility?.min_budget}起
                  </span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  点击查看详细方案 →
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MarketPage
