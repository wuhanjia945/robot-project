import React, { useState, useEffect } from 'react'

const HardwarePage: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [kits, setKits] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedKit, setSelectedKit] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => { loadCategories(); loadKits() }, [])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/hardware/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (e) { console.error(e) }
  }

  const loadKits = async () => {
    try {
      const res = await fetch('/api/hardware/kits')
      const data = await res.json()
      setKits(data.kits || [])
    } catch (e) { console.error(e) }
  }

  const loadByCategory = async (cat: string) => {
    setSelectedCategory(cat)
    setLoading(true)
    try {
      const res = await fetch(`/api/hardware/list?category=${encodeURIComponent(cat)}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const levelConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    beginner: { label: '入门', color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(0,229,195,0.2)' },
    intermediate: { label: '中级', color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(255,192,72,0.2)' },
    advanced: { label: '高级', color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,71,87,0.2)' },
  }

  const kitAlgorithms: Record<string, { name: string; description: string; difficulty: number }[]> = {
    wheeled: [
      { name: '差速运动学', description: '底盘运动控制基础', difficulty: 1 },
      { name: 'PID速度控制', description: '电机速度闭环控制', difficulty: 2 },
      { name: 'SLAM建图', description: '激光/视觉SLAM构建地图', difficulty: 4 },
      { name: 'Nav2自主导航', description: 'ROS2导航框架实现路径规划', difficulty: 3 },
    ],
    arm: [
      { name: 'DH参数正运动学', description: '关节角度→末端位姿', difficulty: 2 },
      { name: '数值逆运动学', description: '末端位姿→关节角度', difficulty: 3 },
      { name: 'MoveIt2路径规划', description: '避障+轨迹规划', difficulty: 3 },
      { name: '视觉伺服抓取', description: '摄像头引导精准抓取', difficulty: 4 },
    ],
    quadruped: [
      { name: '四足正/逆运动学', description: '足端位置与关节角度互算', difficulty: 2 },
      { name: 'CPG步态生成', description: '节律步态trot/walk/gallop', difficulty: 4 },
      { name: 'MPC运动控制', description: '模型预测控制优化足端落点', difficulty: 5 },
      { name: 'RL强化学习行走', description: 'Isaac Sim训练Sim2Real部署', difficulty: 5 },
    ],
  }

  const kitDeployment: Record<string, { steps: { title: string; desc: string; cmd?: string }[]; framework: string; repo: string }> = {
    wheeled: {
      framework: 'Arduino IDE / ROS2',
      repo: 'https://github.com/ros2',
      steps: [
        { title: '1. 硬件组装', desc: '按BOM清单采购物料，组装底盘+电机+控制器', cmd: '' },
        { title: '2. 接线检查', desc: '电机驱动L298N连接Arduino，超声波接数字口', cmd: '' },
        { title: '3. 烧录基础代码', desc: 'Arduino IDE烧录电机驱动+超声波避障程序', cmd: 'arduino-cli upload -p COM3' },
        { title: '4. 遥控测试', desc: '蓝牙/串口遥控前进后退转弯', cmd: '' },
        { title: '5. 升级ROS2', desc: '换用树莓派+ROS2实现SLAM导航', cmd: 'sudo apt install ros-humble-nav2' },
      ],
    },
    arm: {
      framework: 'ROS2 + MoveIt2',
      repo: 'https://github.com/ros-planning/moveit2',
      steps: [
        { title: '1. 组装机械臂', desc: '3D打印件+6个总线舵机，按图纸组装' },
        { title: '2. 接线测试', desc: '串口总线转换器连接树莓派，测试每个舵机响应' },
        { title: '3. URDF建模', desc: '创建机器人URDF模型，配置关节参数' },
        { title: '4. MoveIt2配置', desc: '使用MoveIt Setup Assistant配置运动规划' },
        { title: '5. 视觉抓取', desc: '加入摄像头，实现ArUco标记定位+自动抓取' },
      ],
    },
    quadruped: {
      framework: 'ROS2 + MuJoCo/Isaac Sim',
      repo: 'https://github.com/unitreerobotics/unitree_rl_lab',
      steps: [
        { title: '1. 组装四足', desc: '3D打印件+12个总线舵机，按图纸组装四条腿' },
        { title: '2. 接线测试', desc: 'STM32下位机驱动舵机，树莓派上位机通信' },
        { title: '3. 运动学调试', desc: '实现正逆运动学，验证足端位置控制' },
        { title: '4. 仿真训练', desc: '在MuJoCo/Isaac Sim中训练步态策略' },
        { title: '5. Sim2Real部署', desc: '导出ONNX模型部署到实机，调试行走' },
      ],
    },
  }

  const sectionTitle = (text: string, color: string) => (
    <div style={{
      fontSize: 12, fontWeight: 600, color, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.06em', marginBottom: 16,
    }}>{text}</div>
  )

  if (selectedKit) {
    const lc = levelConfig[selectedKit.level] || levelConfig.beginner
    const algos = kitAlgorithms[selectedKit.robot_type] || []
    const deploy = kitDeployment[selectedKit.robot_type]
    const bomTotalMin = (selectedKit.bom || []).reduce((s: number, b: any) => s + (b.qty || 1) * (b.unit_price_min || 0), 0)
    const bomTotalMax = (selectedKit.bom || []).reduce((s: number, b: any) => s + (b.qty || 1) * (b.unit_price_max || 0), 0)

    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button onClick={() => setSelectedKit(null)} style={{
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
              <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{selectedKit.name}</h2>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                background: lc.bg, border: `1px solid ${lc.border}`,
                color: lc.color, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
              }}>{lc.label}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 32, fontWeight: 700, color: 'var(--orange)', fontFamily: 'var(--font-mono)',
              }}>
                <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>¥</span>
                {selectedKit.total_price_min}
                <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}> — ¥{selectedKit.total_price_max}</span>
              </div>
            </div>
          </div>

          {selectedKit.specs && Object.keys(selectedKit.specs).length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {sectionTitle('SPECS 规格概览', 'var(--accent)')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {Object.entries(selectedKit.specs).map(([key, val]: [string, any]) => (
                  <div key={key} style={{
                    padding: '12px 16px', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{key}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{String(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            {sectionTitle('BOM 清单', 'var(--accent)')}
            {(selectedKit.bom || []).length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,229,195,0.1)' }}>
                    {['序号', '物料名称', '数量', '单价(¥)', '小计(¥)'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
                        color: 'var(--accent)', textAlign: 'left', fontWeight: 600,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selectedKit.bom || []).map((b: any, idx: number) => {
                    const subtotalMin = (b.qty || 1) * (b.unit_price_min || 0)
                    const subtotalMax = (b.qty || 1) * (b.unit_price_max || 0)
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)' }}>{b.name}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{b.qty || 1}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {b.unit_price_min || 0}{b.unit_price_max ? ` — ${b.unit_price_max}` : ''}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}>
                          {subtotalMin}{subtotalMax !== subtotalMin ? ` — ${subtotalMax}` : ''}
                        </td>
                      </tr>
                    )
                  })}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td colSpan={4} style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>合计</td>
                    <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 700, color: 'var(--orange)', fontFamily: 'var(--font-mono)' }}>
                      ¥{bomTotalMin} — ¥{bomTotalMax}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无BOM清单数据</p>
            )}
          </div>

          {algos.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {sectionTitle('配套算法推荐', 'var(--yellow)')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {algos.map((algo, idx) => (
                  <div key={idx} style={{
                    padding: '16px 18px', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--yellow)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{algo.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--yellow)', fontFamily: 'var(--font-mono)' }}>
                        {'●'.repeat(algo.difficulty)}{'○'.repeat(5 - algo.difficulty)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{algo.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deploy && (
            <div style={{ marginBottom: 28 }}>
              {sectionTitle('可部署方案', 'var(--blue)')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {deploy.steps.map((step, idx) => (
                  <div key={idx} style={{
                    padding: '14px 18px', background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--blue)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</div>
                    {step.cmd && (
                      <div style={{
                        marginTop: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
                        borderRadius: 'var(--radius-sm)', fontSize: 12,
                        color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                      }}>
                        $ {step.cmd}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{
                padding: '16px 20px', background: 'rgba(0,229,195,0.06)',
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,229,195,0.12)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>推荐框架</div>
                  <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{deploy.framework}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>参考仓库</div>
                  <a href={deploy.repo} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 13, color: 'var(--blue)', textDecoration: 'none', fontFamily: 'var(--font-mono)',
                  }}>{deploy.repo}</a>
                </div>
              </div>
            </div>
          )}

          {selectedKit.notes && (
            <div style={{
              padding: '16px 20px', background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--text-muted)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>NOTES 备注</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedKit.notes}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>硬件方案</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          浏览硬件选型、价格参考和完整机器人方案
        </p>
      </div>

      {kits.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em', marginBottom: 20,
          }}>ROBOT KITS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {kits.map((kit, i) => {
              const lc = levelConfig[kit.level] || levelConfig.beginner
              return (
                <div key={i} onClick={() => setSelectedKit(kit)} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '28px',
                  backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
                  transition: 'all var(--transition-normal)',
                  animation: `fadeIn 0.3s ease-out ${i * 0.06}s both`,
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{kit.name}</h3>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                        background: lc.bg, border: `1px solid ${lc.border}`,
                        color: lc.color, fontSize: 11, fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}>{lc.label}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 26, fontWeight: 700, color: 'var(--orange)',
                    fontFamily: 'var(--font-mono)', marginBottom: 12,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>¥</span>
                    {kit.total_price_min}
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> — ¥{kit.total_price_max}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{kit.notes}</p>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingTop: 14, borderTop: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {kit.bom?.length || 0} BOM items
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {kit.robot_type}
                    </span>
                  </div>
                  <div style={{
                    marginTop: 12, textAlign: 'right',
                    fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-display)',
                    opacity: 0.8,
                  }}>
                    查看完整方案 →
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--blue)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em', marginBottom: 20,
        }}>COMPONENTS</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => loadByCategory(cat)} style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              border: selectedCategory === cat ? '1px solid var(--blue)' : '1px solid var(--border-subtle)',
              background: selectedCategory === cat ? 'var(--blue-dim)' : 'transparent',
              color: selectedCategory === cat ? 'var(--blue)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-display)',
              transition: 'all var(--transition-fast)',
            }}>{cat}</button>
          ))}
        </div>
        {selectedCategory && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {items.map((item, i) => (
              <div key={i} onClick={() => setSelectedItem(item)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '24px',
                backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
                animation: `fadeIn 0.3s ease-out ${i * 0.04}s both`,
                cursor: 'pointer',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{item.name}</h4>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.brand} {item.model || ''}
                  </div>
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--orange)',
                  fontFamily: 'var(--font-mono)', marginBottom: 12,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>¥</span>
                  {item.price_min}
                  <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}> — ¥{item.price_max}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{item.notes}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {(item.compatibility_tags || []).map((tag: string, j: number) => (
                    <span key={j} style={{
                      padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(0,0,0,0.25)', fontSize: 10,
                      color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                    }}>{tag}</span>
                  ))}
                </div>
                <div style={{
                  marginTop: 12, textAlign: 'right',
                  fontSize: 12, color: 'var(--blue)', fontFamily: 'var(--font-display)',
                  opacity: 0.8,
                }}>
                  查看详情 →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (() => (
        <div onClick={() => setSelectedItem(null)} style={{
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
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>
                  {selectedItem.name}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selectedItem.brand} {selectedItem.model || ''}
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{
                fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer',
                background: 'transparent', border: 'none', lineHeight: 1,
                padding: 4,
              }}>×</button>
            </div>

            <div style={{
              fontSize: 28, fontWeight: 700, color: 'var(--orange)',
              fontFamily: 'var(--font-mono)', marginBottom: 24,
            }}>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>¥</span>
              {selectedItem.price_min}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> — ¥{selectedItem.price_max}</span>
            </div>

            {selectedItem.specs && Object.keys(selectedItem.specs).length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  SPECS 规格参数
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,229,195,0.1)' }}>
                      {['参数', '值'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)',
                          color: 'var(--accent)', textAlign: 'left', fontWeight: 600,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedItem.specs).map(([key, val]: [string, any], idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{key}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(selectedItem.compatibility_tags || []).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  兼容性标签
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(selectedItem.compatibility_tags || []).map((tag: string, idx: number) => (
                    <span key={idx} style={{
                      padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0,229,195,0.08)', border: '1px solid rgba(0,229,195,0.15)',
                      fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {(selectedItem.applicable_robots || []).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                  适用机器人
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(selectedItem.applicable_robots || []).map((r: string, idx: number) => (
                    <span key={idx} style={{
                      padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                      fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                    }}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.notes && (
              <div style={{
                padding: '16px 20px', background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--text-muted)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>NOTES 备注</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedItem.notes}</div>
              </div>
            )}
          </div>
        </div>
      ))()}
    </div>
  )
}

export default HardwarePage
