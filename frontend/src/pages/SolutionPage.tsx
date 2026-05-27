import React, { useState } from 'react'

const SolutionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    robot_type: 'wheeled', core_function_1: '', budget_min: 0, budget_max: 3000,
    payload: 0, speed: 0, team_skills: '', timeline: 8,
  })
  const [solution, setSolution] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateSolution = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/solution/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robot_type: formData.robot_type,
          core_functions: [{ name: formData.core_function_1, priority: 'critical' }],
          performance: { payload_kg: formData.payload || null, speed_ms: formData.speed || null },
          budget: { min_amount: formData.budget_min, max_amount: formData.budget_max },
          constraints: { team_skills: formData.team_skills.split(',').filter(Boolean), timeline_weeks: formData.timeline },
        }),
      })
      const data = await res.json()
      setSolution(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'var(--font-display)',
    transition: 'border-color var(--transition-fast)', outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500,
    color: 'var(--text-secondary)', textTransform: 'uppercase',
    letterSpacing: '0.06em', fontFamily: 'var(--font-mono)',
  }

  const robotTypes = [
    { value: 'wheeled', label: '轮式机器人', desc: '差速/麦轮底盘' },
    { value: 'legged', label: '足式机器人', desc: '四足/人形' },
    { value: 'arm', label: '机械臂', desc: '4-6DOF' },
    { value: 'composite', label: '复合机器人', desc: '底盘+臂' },
    { value: 'drone', label: '无人机', desc: '多旋翼/固定翼' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>方案生成</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          输入需求参数，系统自动生成完整技术方案、BOM清单与算法选型
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 28, alignItems: 'start' }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: 28,
          backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
          position: 'sticky', top: 100,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 24 }}>
            PARAMETERS
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>机器人类型</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {robotTypes.map(rt => (
                <button key={rt.value} onClick={() => setFormData({ ...formData, robot_type: rt.value })} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  border: formData.robot_type === rt.value ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: formData.robot_type === rt.value ? 'var(--accent-dim)' : 'rgba(0,0,0,0.2)',
                  color: formData.robot_type === rt.value ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-display)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{rt.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{rt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>核心功能</label>
            <input type="text" value={formData.core_function_1} onChange={e => setFormData({ ...formData, core_function_1: e.target.value })} placeholder="如：自主导航、视觉抓取" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>预算范围 (CNY)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={formData.budget_min || ''} onChange={e => setFormData({ ...formData, budget_min: parseFloat(e.target.value) || 0 })} placeholder="最低" style={inputStyle} />
              <input type="number" value={formData.budget_max || ''} onChange={e => setFormData({ ...formData, budget_max: parseFloat(e.target.value) || 0 })} placeholder="最高" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>负载 (kg)</label>
              <input type="number" value={formData.payload || ''} onChange={e => setFormData({ ...formData, payload: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>速度 (m/s)</label>
              <input type="number" value={formData.speed || ''} onChange={e => setFormData({ ...formData, speed: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>团队技能</label>
            <input type="text" value={formData.team_skills} onChange={e => setFormData({ ...formData, team_skills: e.target.value })} placeholder="Python, 嵌入式, 算法" style={inputStyle} />
          </div>

          <button onClick={generateSolution} disabled={loading} style={{
            width: '100%', padding: '14px 0', background: 'var(--accent)', color: '#060810',
            border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
            boxShadow: '0 0 24px rgba(0, 229, 195, 0.2)',
            transition: 'all var(--transition-fast)',
          }}>
            {loading ? '生成中...' : '生成技术方案'}
          </button>
        </div>

        <div>
          {solution ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {solution.contradictions?.length > 0 && (
                <div style={{
                  background: 'var(--red-dim)', border: '1px solid rgba(255,71,87,0.2)',
                  borderRadius: 'var(--radius-md)', padding: 20,
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 12, fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                    CONTRADICTIONS
                  </div>
                  {solution.contradictions.map((c: any, i: number) => (
                    <div key={i} style={{ padding: '10px 14px', marginBottom: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${c.severity === 'critical' ? 'var(--red)' : 'var(--yellow)'}` }}>
                      <div style={{ color: c.severity === 'critical' ? 'var(--red)' : 'var(--yellow)', fontSize: 13, fontWeight: 500 }}>[{c.severity}] {c.message}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: 28, backdropFilter: 'blur(12px)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 20 }}>
                  ARCHITECTURE
                </div>
                {(solution.architecture_layers || []).map((layer: any, i: number) => (
                  <div key={i} style={{
                    marginBottom: 10, padding: '14px 18px',
                    background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--accent)',
                    animation: `fadeIn 0.3s ease-out ${i * 0.06}s both`,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{layer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {layer.components.join(' → ')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{layer.description}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: 28, backdropFilter: 'blur(12px)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
                    BOM LIST
                  </div>
                  <div style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--orange-dim)', border: '1px solid rgba(255,107,53,0.2)',
                    fontSize: 14, fontWeight: 600, color: 'var(--orange)', fontFamily: 'var(--font-mono)',
                  }}>
                    ¥{solution.estimated_cost_min} — ¥{solution.estimated_cost_max}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(solution.bom?.items || []).map((item: any, i: number) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '100px 1fr 48px 120px',
                      gap: 12, padding: '10px 14px', alignItems: 'center',
                      background: i % 2 === 0 ? 'rgba(0,0,0,0.15)' : 'transparent',
                      borderRadius: 'var(--radius-sm)', fontSize: 13,
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{item.item.category}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{item.item.name}</span>
                      <span style={{ color: 'var(--text-secondary)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>×{item.quantity}</span>
                      <span style={{ color: 'var(--orange)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>¥{item.item.price_min}–{item.item.price_max}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: 28, backdropFilter: 'blur(12px)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 16 }}>
                    ALGORITHMS
                  </div>
                  {(solution.algorithms || []).map((algo: any, i: number) => (
                    <div key={i} style={{
                      padding: '12px 16px', marginBottom: 8,
                      background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--blue)',
                    }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>
                        {algo.algorithm.name}
                        <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--blue-dim)', color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
                          {algo.algorithm.level}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{algo.algorithm.description}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: 28, backdropFilter: 'blur(12px)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 16 }}>
                    TECH STACK
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(solution.tech_stack || []).map((ts: any, i: number) => (
                      <div key={i} style={{
                        padding: '8px 14px', background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{ts.name}</span>
                        <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{ts.version}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)', padding: '80px 60px',
              textAlign: 'center', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◈</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>填写参数后点击生成，方案将在此展示</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SolutionPage
