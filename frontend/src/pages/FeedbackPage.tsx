import React, { useState } from 'react'

const feedbackTypes = [
  { value: 'suggestion', label: '功能建议' },
  { value: 'bug', label: 'Bug反馈' },
  { value: 'correction', label: '内容纠错' },
  { value: 'question', label: '使用问题' },
  { value: 'other', label: '其他' },
]

const roleOptions = [
  { value: 'beginner', label: '零基础小白' },
  { value: 'intermediate', label: '有一定基础' },
  { value: 'developer', label: '专业开发者' },
  { value: 'researcher', label: '研究人员' },
  { value: 'teacher', label: '教师' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  background: 'rgba(0,0,0,0.25)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-display)',
  outline: 'none',
  transition: 'border-color var(--transition-fast)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 8,
  fontFamily: 'var(--font-display)',
}

const FeedbackPage: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('')
  const [role, setRole] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
            用户反馈 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Feedback</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
            帮助我们改进，让每个人都能手搓一台机器人
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          backdropFilter: 'blur(12px)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          maxWidth: 600,
          margin: '0 auto',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '2px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 28,
            color: 'var(--accent)',
            boxShadow: '0 0 30px rgba(0,229,195,0.15)',
          }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            感谢您的反馈！
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
            我们会认真对待每一条建议
          </p>
          <button onClick={() => {
            setSubmitted(false)
            setFeedbackType('')
            setRole('')
            setTitle('')
            setDescription('')
            setContact('')
          }} style={{
            padding: '12px 32px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'all var(--transition-fast)',
          }}>
            继续提交
          </button>
        </div>

        <div style={{
          marginTop: 32,
          textAlign: 'center',
          padding: '20px 24px',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: 'var(--radius-md)',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            也可以在{' '}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
              color: 'var(--blue)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
            }}>
              GitHub Issues
            </a>
            {' '}中提交反馈
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          用户反馈 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Feedback</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          帮助我们改进，让每个人都能手搓一台机器人
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 36,
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-card)',
        maxWidth: 680,
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>反馈类型 <span style={{ color: 'var(--red)' }}>*</span></label>
              <select
                value={feedbackType}
                onChange={e => setFeedbackType(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  color: feedbackType ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <option value="" disabled style={{ background: 'var(--bg-secondary)' }}>请选择类型</option>
                {feedbackTypes.map(t => (
                  <option key={t.value} value={t.value} style={{ background: 'var(--bg-secondary)' }}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>您的角色 <span style={{ color: 'var(--red)' }}>*</span></label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  color: role ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                <option value="" disabled style={{ background: 'var(--bg-secondary)' }}>请选择角色</option>
                {roleOptions.map(r => (
                  <option key={r.value} value={r.value} style={{ background: 'var(--bg-secondary)' }}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>反馈标题 <span style={{ color: 'var(--red)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="简要描述您的反馈"
              style={{
                ...inputStyle,
                color: title ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>详细描述 <span style={{ color: 'var(--red)' }}>*</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              placeholder="请详细描述您的建议、问题或反馈内容..."
              rows={6}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 120,
                color: description ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>联系方式 <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(可选)</span></label>
            <input
              type="text"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="邮箱/GitHub/微信，方便我们跟进"
              style={{
                ...inputStyle,
                color: contact ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, var(--accent), #00b89c)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#060810',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 0 20px rgba(0,229,195,0.2)',
          }}>
            提交反馈
          </button>
        </form>
      </div>

      <div style={{
        marginTop: 24,
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: 'var(--radius-md)',
        maxWidth: 680,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          也可以在{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
            color: 'var(--blue)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
          }}>
            GitHub Issues
          </a>
          {' '}中提交反馈
        </span>
      </div>
    </div>
  )
}

export default FeedbackPage
