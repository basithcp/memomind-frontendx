import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/**
 * MenuDropdown - a small menu toggled from left of prompt bar.
 * Includes navigation links to switch between Notes, MCQs, and Flashcards for the same document.
 */
const MenuDropdown = ({ open: propOpen, onToggle }) => {
  const [open, setOpen] = useState(Boolean(propOpen))
  const ref = useRef(null)
  const { itemName, itemId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(Boolean(propOpen))
  }, [propOpen])

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const toggle = () => {
    setOpen((s) => {
      const next = !s
      onToggle && onToggle()
      return next
    })
  }

  // Navigation functions to switch between content types for the same document
  const navigateToNotes = () => {
    if (itemName && itemId) {
      navigate(`/generate-notes/${itemName}/${itemId}`)
      setOpen(false)
    }
  }

  const navigateToMCQs = () => {
    if (itemName && itemId) {
      navigate(`/generate-mcq/${itemName}/${itemId}`)
      setOpen(false)
    }
  }

  const navigateToFlashcards = () => {
    if (itemName && itemId) {
      navigate(`/generate-flashcards/${itemName}/${itemId}`)
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-light"
        onClick={toggle}
        style={{ width: 44, height: 44, borderRadius: 10 }}
        aria-haspopup="true"
        aria-expanded={open}
        title="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            left: 0,
            minWidth: 180,
            background: '#fff',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 8px 24px rgba(20,20,30,0.12)',
            zIndex: 2000,
          }}
        >
          {/* Navigation links to switch between content types for the same document */}
          <button 
            className="dropdown-item" 
            style={{ display: 'block', width: '100%', textAlign: 'left' }} 
            onClick={navigateToNotes}
            disabled={!itemName || !itemId}
          >
            📝 Generate Notes
          </button>
          <button 
            className="dropdown-item" 
            style={{ display: 'block', width: '100%', textAlign: 'left' }} 
            onClick={navigateToMCQs}
            disabled={!itemName || !itemId}
          >
            ❓ Generate MCQs
          </button>
          <button 
            className="dropdown-item" 
            style={{ display: 'block', width: '100%', textAlign: 'left' }} 
            onClick={navigateToFlashcards}
            disabled={!itemName || !itemId}
          >
            🃏 Generate Flashcards
          </button>
        </div>
      )}
    </div>
  )
}

export default MenuDropdown
