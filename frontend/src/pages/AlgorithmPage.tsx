import React, { useState, useEffect } from 'react'

const AlgorithmPage: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<any[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeLevel, setActiveLevel] = useState<string>('all')
  const [selectedAlgo, setSelectedAlgo] = useState<any>(null)

  useEffect(() => { loadAlgorithms() }, [])

  const loadAlgorithms = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/algorithm/list')
      const data = await res.json()
      setAlgorithms(data.algorithms || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const searchAlgorithms = async () => {
    if (!keyword) { loadAlgorithms(); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/algorithm/search?keyword=${encodeURIComponent(keyword)}`)
      const data = await res.json()
      setAlgorithms(data.algorithms || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const levelConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    basic: { label: '基础', color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(0,229,195,0.2)' },
    advanced: { label: '进阶', color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(255,192,72,0.2)' },
    expert: { label: '专家', color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,71,87,0.2)' },
  }

  const deploySuggestion: Record<string, string> = {
    basic: '可在STM32/ESP32上运行，控制频率可达100-1000Hz',
    advanced: '建议使用树莓派5或Jetson Orin Nano，控制频率10-100Hz',
    expert: '需要Jetson Orin NX/AGX或工控机+GPU，控制频率1-10Hz',
  }

  const filteredAlgorithms = activeLevel === 'all' ? algorithms : algorithms.filter(a => a.level === activeLevel)

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>算法供给</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          浏览22个运动控制算法，或提交硬件信息获取配套算法方案
        </p>
      </div>

      <div style={{
        display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center',
      }}>
        <div style={{
          flex: 1, position: 'relative',
        }}>
          <input
            type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchAlgorithms()}
            placeholder="搜索算法 — PID、运动学、步态、MPC..."
            style={{
              width: '100%', padding: '14px 20px 14px 44px',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: 14, fontFamily: 'var(--font-display)',
              backdropFilter: 'blur(12px)', outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
          />
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: 16,
          }}>⌕</span>
        </div>
        <button onClick={searchAlgorithms} style={{
          padding: '14px 28px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-md)', color: 'var(--accent)', fontSize: 14,
          fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-display)',
          transition: 'all var(--transition-fast)',
        }}>搜索</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[
          { key: 'all', label: '全部', count: algorithms.length },
          { key: 'basic', label: '基础', count: algorithms.filter(a => a.level === 'basic').length },
          { key: 'advanced', label: '进阶', count: algorithms.filter(a => a.level === 'advanced').length },
          { key: 'expert', label: '专家', count: algorithms.filter(a => a.level === 'expert').length },
        ].map(f => (
          <button key={f.key} onClick={() => setActiveLevel(f.key)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-sm)',
            border: activeLevel === f.key ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            background: activeLevel === f.key ? 'var(--accent-dim)' : 'transparent',
            color: activeLevel === f.key ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)',
            transition: 'all var(--transition-fast)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {f.label}
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: activeLevel === f.key ? 'var(--accent)' : 'var(--text-muted)',
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {filteredAlgorithms.map((algo, i) => {
          const lc = levelConfig[algo.level] || levelConfig.basic
          return (
            <div key={i} onClick={() => setSelectedAlgo(algo)} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '24px 28px',
              backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition-normal)',
              animation: `fadeIn 0.3s ease-out ${i * 0.03}s both`,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{algo.name}</h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {algo._category || algo.category}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                  background: lc.bg, border: `1px solid ${lc.border}`,
                  color: lc.color, fontSize: 11, fontWeight: 600,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                }}>{lc.label}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                {algo.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {(algo.applicable_robots || []).map((r: string, j: number) => (
                  <span key={j} style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'rgba(0,0,0,0.25)', fontSize: 11,
                    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                  }}>{r}</span>
                ))}
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  难度 <span style={{ color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                    {'●'.repeat(algo.difficulty || 1)}{'○'.repeat(5 - (algo.difficulty || 1))}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {(algo.parameters || []).length} params
                </div>
              </div>
              <div style={{
                marginTop: 12, textAlign: 'right',
                fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-display)',
                opacity: 0.8,
              }}>
                查看详情 →
              </div>
            </div>
          )
        })}
      </div>

      {selectedAlgo && (() => {
        const lc = levelConfig[selectedAlgo.level] || levelConfig.basic
        return (
          <div onClick={() => setSelectedAlgo(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              maxWidth: 800, width: '90%', maxHeight: '85vh', overflowY: 'auto',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              padding: 36, backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedAlgo.name}
                  </h2>
                  <span style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                    background: lc.bg, border: `1px solid ${lc.border}`,
                    color: lc.color, fontSize: 11, fontWeight: 600,
                    fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
                  }}>{lc.label}</span>
                </div>
                <button onClick={() => setSelectedAlgo(null)} style={{
                  fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer',
                  background: 'transparent', border: 'none', lineHeight: 1,
                  padding: 4,
                }}>×</button>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
                {selectedAlgo.description}
              </p>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  PARAMETERS
                </h3>
                {(selectedAlgo.parameters || []).length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,229,195,0.1)' }}>
                        {['参数名', '类型', '默认值', '范围', '说明'].map(h => (
                          <th key={h} style={{
                            padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
                            color: 'var(--accent)', textAlign: 'left', fontWeight: 600,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedAlgo.parameters || []).map((p: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{p.name}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{p.type}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{p.default ?? '-'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{p.range ?? '-'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{p.description ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无参数信息</p>
                )}
              </div>

              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  INPUT / OUTPUT
                </h3>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>输入</div>
                    {(selectedAlgo.input_spec || []).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(selectedAlgo.input_spec || []).map((inp: any, idx: number) => (
                          <div key={idx} style={{
                            padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius-sm)', fontSize: 13,
                            display: 'flex', justifyContent: 'space-between',
                          }}>
                            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{inp.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{inp.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无输入信息</p>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>输出</div>
                    {(selectedAlgo.output_spec || []).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(selectedAlgo.output_spec || []).map((out: any, idx: number) => (
                          <div key={idx} style={{
                            padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius-sm)', fontSize: 13,
                            display: 'flex', justifyContent: 'space-between',
                          }}>
                            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{out.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{out.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无输出信息</p>
                    )}
                  </div>
                </div>
              </div>

              {(selectedAlgo.applicable_robots || []).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                    适用机器人
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(selectedAlgo.applicable_robots || []).map((r: string, idx: number) => (
                      <span key={idx} style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0,229,195,0.08)', border: '1px solid rgba(0,229,195,0.15)',
                        fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                      }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlgo.code_template && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                    代码模板
                  </h3>
                  <div style={{
                    padding: '14px 18px', background: 'rgba(0,0,0,0.3)',
                    borderRadius: 'var(--radius-md)', fontSize: 13,
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {selectedAlgo.code_template}
                  </div>
                </div>
              )}

              {selectedAlgo.required_sensors && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                    所需传感器
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {Array.isArray(selectedAlgo.required_sensors) ? selectedAlgo.required_sensors.join('、') : selectedAlgo.required_sensors}
                  </p>
                </div>
              )}

              {selectedAlgo.required_compute && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                    所需计算平台
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {Array.isArray(selectedAlgo.required_compute) ? selectedAlgo.required_compute.join('、') : selectedAlgo.required_compute}
                  </p>
                </div>
              )}

              <div style={{
                padding: '16px 20px', background: 'rgba(0,229,195,0.06)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,229,195,0.12)',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  部署建议
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {deploySuggestion[selectedAlgo.level] || deploySuggestion.basic}
                </p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default AlgorithmPage
