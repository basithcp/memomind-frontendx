import { useState } from 'react'
import MenuDropdown from './MenuDropDown.jsx'

/**
 * ChatPromptBar
 *
 * Props:
 * - onSend(prompt: string, callback): called when user presses enter/clicks send.
 *
 * This component is styled to sit fixed near the bottom by default. If you already
 * have a global fixed area, you can put <ChatPromptBar /> there or change styles.
 */
const ChatPromptBar = ({ onSend = () => {} }) => {
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed, (cb) => cb && cb())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      setText('')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 280,
        right: 20,
        bottom: 18,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 6px 18px rgba(20,20,30,0.06)',
          borderRadius: 14,
          background: '#fff',
          padding: '8px 10px',
          gap: 10,
        }}
      >
        {/* Left menu button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MenuDropdown open={menuOpen} onToggle={() => setMenuOpen((s) => !s)} />
        </div>

        {/* Input */}
        <div style={{ flex: 1 }}>
          <textarea
            className="form-control"
            placeholder="write you follow up here....."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              resize: 'none',
              height: 44,
              borderRadius: 8,
              padding: '8px 10px',
              border: '1px solid #e6e6ef',
              boxShadow: 'none',
              outline: 'none',
              fontSize: 14,
            }}
          />
        </div>

        {/* Send button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center"
            style={{
              height: 44,
              width: 44,
              borderRadius: 10,
              padding: 8,
            }}
            onClick={handleSend}
            aria-label="Send"
            title="Send"
          >
            {/* Inline svg fallback if you don't have send.svg */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPromptBar
