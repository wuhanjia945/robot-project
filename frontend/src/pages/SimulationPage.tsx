import React from 'react'

interface Tutorial {
  title: string
  url: string
}

interface SimPlatform {
  name: string
  nameCn: string
  level: string
  description: string
  features: string[]
  scenarios: string[]
  tutorials: Tutorial[]
  website: string
  color: string
}

const simPlatforms: SimPlatform[] = [
  {
    name: 'Gazebo',
    nameCn: 'Gazebo 仿真器',
    level: '入门',
    description: 'ROS生态最常用的仿真器，与ROS2深度集成，适合移动机器人导航和机械臂仿真',
    features: ['ROS2原生支持', 'SDF/URDF模型格式', '传感器插件丰富', '开源免费', '社区资源多'],
    scenarios: ['移动机器人导航', '机械臂运动规划', 'SLAM仿真', '多机器人仿真'],
    tutorials: [
      { title: 'Gazebo官方教程', url: 'https://gazebosim.org/docs' },
      { title: 'ROS2+Gazebo快速入门', url: 'https://docs.ros.org/en/humble/Tutorials/Advanced/Simulators/Gazebo.html' },
    ],
    website: 'https://gazebosim.org',
    color: 'var(--accent)',
  },
  {
    name: 'MuJoCo',
    nameCn: 'MuJoCo 物理引擎',
    level: '进阶',
    description: 'DeepMind维护的高精度物理仿真引擎，接触动力学精确，足式机器人研究首选',
    features: ['高精度接触动力学', 'GPU加速渲染', 'XML模型格式(MJCF)', 'Python/C++ API', 'DeepMind开源'],
    scenarios: ['四足/人形机器人', '灵巧手操作', '强化学习训练', 'Sim2Real研究'],
    tutorials: [
      { title: 'MuJoCo官方文档', url: 'https://mujoco.readthedocs.io' },
      { title: 'MuJoCo中文教程', url: 'https://github.com/kevinzakka/mujoco_overview' },
    ],
    website: 'https://mujoco.org',
    color: 'var(--yellow)',
  },
  {
    name: 'Isaac Sim',
    nameCn: 'NVIDIA Isaac Sim',
    level: '专业',
    description: 'NVIDIA基于Omniverse的大规模并行仿真平台，GPU加速，适合RL大规模训练',
    features: ['GPU大规模并行', 'RTX光线追踪渲染', 'ROS2集成', 'Isaac Lab RL框架', '域随机化'],
    scenarios: ['强化学习大规模训练', 'Sim2Real迁移', '数字孪生', '自动驾驶仿真'],
    tutorials: [
      { title: 'Isaac Sim官方文档', url: 'https://docs.omniverse.nvidia.com/isaacsim' },
      { title: 'Isaac Lab教程', url: 'https://isaac-sim.github.io/IsaacLab' },
    ],
    website: 'https://developer.nvidia.com/isaac-sim',
    color: 'var(--orange)',
  },
  {
    name: 'PyBullet',
    nameCn: 'PyBullet 仿真器',
    level: '入门',
    description: '基于Bullet物理引擎的Python仿真器，API简洁易用，入门RL仿真的最佳选择',
    features: ['Python API简洁', 'URDF模型支持', '内置RL示例', '开源免费', '安装简单pip install'],
    scenarios: ['RL入门学习', '简单机器人仿真', '教学演示', '快速原型验证'],
    tutorials: [
      { title: 'PyBullet快速入门', url: 'https://pybullet.org/wordpress/index.php/forum-2/' },
      { title: 'PyBullet RL教程', url: 'https://github.com/bernhard2202/improved-gail' },
    ],
    website: 'https://pybullet.org',
    color: 'var(--green)',
  },
  {
    name: 'Webots',
    nameCn: 'Webots 仿真器',
    level: '入门',
    description: 'Cyberbotics开发的跨平台机器人仿真器，内置丰富机器人模型，适合教学和快速原型',
    features: ['跨平台(Win/Mac/Linux)', '内置机器人模型', '拖拽式场景编辑', 'ROS2支持', '教育版免费'],
    scenarios: ['教学实验', '快速原型', '移动机器人仿真', '无人机仿真'],
    tutorials: [
      { title: 'Webots官方教程', url: 'https://cyberbotics.com/doc/guide/index' },
      { title: 'Webots+ROS2教程', url: 'https://github.com/cyberbotics/webots_ros2' },
    ],
    website: 'https://cyberbotics.com',
    color: 'var(--blue)',
  },
  {
    name: 'Genie Sim',
    nameCn: '智元 Genie Sim 3.0',
    level: '专业',
    description: '智元机器人开源的仿真平台，LLM驱动场景生成，支持具身智能策略训练',
    features: ['LLM驱动场景生成', 'AgiBot World数据兼容', '开源免费', 'VLA模型训练', '数字孪生'],
    scenarios: ['具身智能策略训练', 'VLA模型开发', '操作任务仿真', 'Sim2Real迁移'],
    tutorials: [
      { title: 'AgiBot Innovation GitHub', url: 'https://github.com/AgiBot-Innovation' },
    ],
    website: 'https://github.com/AgiBot-Innovation',
    color: 'var(--orange)',
  },
]

const selectionGuide = [
  { level: '零基础入门', recommendation: 'PyBullet 或 Webots — 安装简单，Python API，5分钟上手', color: 'var(--green)' },
  { level: 'ROS2开发', recommendation: 'Gazebo — ROS2生态原生支持，Nav2/MoveIt2仿真标配', color: 'var(--accent)' },
  { level: '足式/灵巧操作', recommendation: 'MuJoCo — 高精度接触动力学，DeepMind维护', color: 'var(--yellow)' },
  { level: 'RL大规模训练', recommendation: 'Isaac Sim — GPU并行加速，Isaac Lab框架', color: 'var(--orange)' },
  { level: '具身智能/VLA', recommendation: 'Genie Sim 3.0 — LLM驱动场景，AgiBot World数据兼容', color: 'var(--orange)' },
]

const levelConfig: Record<string, { color: string; bg: string; border: string }> = {
  '入门': { color: 'var(--green)', bg: 'var(--green-dim)', border: 'rgba(0,229,195,0.2)' },
  '进阶': { color: 'var(--yellow)', bg: 'var(--yellow-dim)', border: 'rgba(255,192,72,0.2)' },
  '专业': { color: 'var(--red)', bg: 'var(--red-dim)', border: 'rgba(255,71,87,0.2)' },
}

const SimulationPage: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          仿真学习 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Simulation</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          了解主流机器人仿真平台，在虚拟世界中验证你的算法
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16, marginBottom: 48 }}>
        {simPlatforms.map((platform, i) => {
          const lc = levelConfig[platform.level] || levelConfig['入门']
          return (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition-normal)',
              animation: `fadeIn 0.3s ease-out ${i * 0.06}s both`,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: platform.color, marginBottom: 2, letterSpacing: '-0.02em' }}>
                    {platform.name}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{platform.nameCn}</div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: lc.bg,
                  border: `1px solid ${lc.border}`,
                  color: lc.color,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}>{platform.level}</span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                {platform.description}
              </p>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginBottom: 8 }}>
                  FEATURES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {platform.features.map((feat, j) => (
                    <span key={j} style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'rgba(0,0,0,0.25)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>{feat}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginBottom: 8 }}>
                  SCENARIOS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {platform.scenarios.map((s, j) => (
                    <span key={j} style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: `${platform.color}10`,
                      border: `1px solid ${platform.color}20`,
                      fontSize: 11,
                      color: platform.color,
                      fontFamily: 'var(--font-mono)',
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', marginBottom: 8 }}>
                  TUTORIALS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {platform.tutorials.map((t, j) => (
                    <a key={j} href={t.url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: 12,
                      color: 'var(--blue)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-mono)',
                      transition: 'color var(--transition-fast)',
                    }}>
                      ↗ {t.title}
                    </a>
                  ))}
                </div>
                <a href={platform.website} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  transition: 'color var(--transition-fast)',
                }}>
                  ⌕ 官网 {platform.website}
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 36,
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}>SELECTION GUIDE</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.02em' }}>
          仿真选择指南
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selectionGuide.map((guide, i) => (
            <div key={i} style={{
              padding: '16px 20px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${guide.color}`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              animation: `fadeIn 0.3s ease-out ${i * 0.08}s both`,
            }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                background: `${guide.color}15`,
                border: `1px solid ${guide.color}25`,
                color: guide.color,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'nowrap',
              }}>{guide.level}</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {guide.recommendation}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimulationPage
