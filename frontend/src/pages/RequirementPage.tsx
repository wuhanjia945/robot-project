import React, { useState } from 'react'

const RequirementPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentRound, setCurrentRound] = useState(1)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [completeness, setCompleteness] = useState(0)
  const [contradictions, setContradictions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const startSession = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/requirement/session', { method: 'POST' })
      const data = await res.json()
      setSessionId(data.session_id)
      setQuestions(data.questions || [])
      setStarted(true)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const submitAnswers = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/requirement/session/${sessionId}/round/${currentRound}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      setCompleteness(data.completeness_score || 0)
      setContradictions(data.contradictions || [])
      if (data.next_round && !data.ready_for_solution) {
        setCurrentRound(data.next_round)
        const qRes = await fetch(`/api/requirement/session/${sessionId}/round/${data.next_round}`)
        const qData = await qRes.json()
        setQuestions(qData.questions || [])
        setAnswers({})
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const roundNames: Record<number, string> = { 1: '定方向', 2: '定细节', 3: '定边界' }

  const robotTypeLabels: Record<string, string> = {
    wheeled: '轮式机器人 Wheeled Robot',
    legged: '足式机器人 Legged Robot',
    arm: '机械臂 Robotic Arm',
    composite: '复合机器人 Composite Robot',
    drone: '无人机 Drone/UAV',
  }

  const robotTypeIcons: Record<string, string> = {
    wheeled: '◎',
    legged: '☆',
    arm: '⊕',
    composite: '◈',
    drone: '△',
  }

  const robotTypeDescs: Record<string, string> = {
    wheeled: '轮式移动 — 最易入门，扫地/送餐/AGV',
    legged: '足式行走 — 四足/人形，适应复杂地形',
    arm: '机械操作 — 抓取/装配，工业/协作臂',
    composite: '移动+操作 — 底盘+臂，全能型',
    drone: '空中飞行 — 航拍/测绘/巡检',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'var(--font-display)',
    transition: 'border-color var(--transition-fast)',
    outline: 'none',
  }

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.03em', marginBottom: 8,
        }}>需求采集</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          通过三轮结构化问卷，系统将深入了解您的机器人开发需求，并实时检测逻辑矛盾
        </p>
      </div>

      {!started ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', padding: '80px 60px',
          textAlign: 'center', backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
            background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--accent)',
          }}>◎</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>开始需求采集</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
            三轮渐进式提问 · 实时矛盾检测 · 智能完整度评分
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 40 }}>
            {[1, 2, 3].map(r => (
              <div key={r} style={{
                padding: '16px 24px', borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
                textAlign: 'center', minWidth: 140,
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  0{r}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{roundNames[r]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 16, textAlign: 'left' }}>
              ROBOT TYPES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {Object.keys(robotTypeLabels).map((key) => (
                <div key={key} style={{
                  padding: '20px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                  textAlign: 'center', cursor: 'default',
                  transition: 'all var(--transition-fast)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-accent)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(0,229,195,0.06)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.25)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
                    background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: 'var(--accent)',
                  }}>
                    {robotTypeIcons[key]}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                    {robotTypeLabels[key]}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {robotTypeDescs[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={startSession} disabled={loading} style={{
            padding: '14px 40px', background: 'var(--accent)', color: '#060810',
            border: 'none', borderRadius: 'var(--radius-md)', fontSize: 15,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 0 24px rgba(0, 229, 195, 0.2)',
          }}>
            {loading ? '初始化中...' : '开始提问'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '20px 24px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                当前轮次
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0{currentRound}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/ 03 · {roundNames[currentRound]}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                {[1, 2, 3].map(r => (
                  <div key={r} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: r <= currentRound ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    transition: 'background var(--transition-normal)',
                  }} />
                ))}
              </div>
            </div>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '20px 24px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                需求完整度
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontSize: 28, fontWeight: 700,
                  color: completeness >= 85 ? 'var(--green)' : completeness >= 50 ? 'var(--yellow)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}>{completeness}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>%</span>
              </div>
              <div style={{
                marginTop: 12, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: completeness >= 85 ? 'var(--green)' : 'var(--yellow)',
                  width: `${completeness}%`,
                  transition: 'width var(--transition-slow)',
                }} />
              </div>
            </div>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)', padding: '20px 24px',
              backdropFilter: 'blur(12px)',
              border: contradictions.length > 0 ? '1px solid rgba(255,71,87,0.2)' : '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                矛盾检测
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontSize: 28, fontWeight: 700,
                  color: contradictions.length > 0 ? 'var(--red)' : 'var(--green)',
                  fontFamily: 'var(--font-mono)',
                }}>{contradictions.length}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>个问题</span>
              </div>
              <div style={{ fontSize: 12, color: contradictions.length > 0 ? 'var(--red)' : 'var(--green)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                {contradictions.length > 0 ? 'NEEDS REVIEW' : 'ALL CLEAR'}
              </div>
            </div>
          </div>

          {contradictions.length > 0 && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20,
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 12, fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                CONTRADICTIONS DETECTED
              </div>
              {contradictions.map((c, i) => (
                <div key={i} style={{
                  padding: '12px 16px', marginBottom: 8,
                  background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)',
                  borderLeft: `3px solid ${c.severity === 'critical' ? 'var(--red)' : 'var(--yellow)'}`,
                }}>
                  <div style={{ color: c.severity === 'critical' ? 'var(--red)' : 'var(--yellow)', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    [{c.severity.toUpperCase()}] {c.message}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{c.suggestion}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: '32px 36px',
            backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
          }}>
            {questions.map((q: any, idx: number) => (
              <div key={q.id} style={{ marginBottom: 24, animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}>
                <label style={{
                  display: 'block', marginBottom: 10, fontWeight: 500,
                  fontSize: 14, color: 'var(--text-primary)',
                }}>
                  {q.text}
                  {q.required && <span style={{ color: 'var(--red)', marginLeft: 4 }}>*</span>}
                </label>
                {q.type === 'select' ? (
                  <select
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">请选择</option>
                    {(q.options || []).map((opt: string) => <option key={opt} value={opt}>{robotTypeLabels[opt] || opt}</option>)}
                  </select>
                ) : q.type === 'range' ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input type="number" placeholder="最低" value={answers[`${q.id}_min`] || ''} onChange={e => setAnswers({ ...answers, [`${q.id}_min`]: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                    <input type="number" placeholder="最高" value={answers[`${q.id}_max`] || ''} onChange={e => setAnswers({ ...answers, [`${q.id}_max`]: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                ) : q.type === 'number' ? (
                  <input type="number" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                ) : (
                  <input type="text" value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} style={inputStyle} />
                )}
              </div>
            ))}
            <button onClick={submitAnswers} disabled={loading} style={{
              padding: '14px 36px', background: 'var(--accent)', color: '#060810',
              border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)',
              transition: 'all var(--transition-fast)',
              boxShadow: '0 0 24px rgba(0, 229, 195, 0.2)',
            }}>
              {loading ? '提交中...' : currentRound < 3 ? '提交并继续 →' : '提交需求 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequirementPage
