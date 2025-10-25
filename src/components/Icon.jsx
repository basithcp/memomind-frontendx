import React from 'react'

const Icon = ({ 
  name, 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'fs-6',
    md: 'fs-4', 
    lg: 'fs-2',
    xl: 'display-1'
  }

  // Icon mapping - you can expand this
  const iconMap = {
    // Navigation icons
    'upload': '📁',
    'notes': '📄', 
    'mcq': '❓',
    'flashcards': '🃏',
    'revision': '🔄',
    'home': '🏠',
    'user': '👤',
    'logout': '→',
    
    // Action icons
    'plus': '➕',
    'edit': '✏️',
    'delete': '🗑️',
    'save': '💾',
    'download': '⬇️',
    'upload-file': '📤',
    'settings': '⚙️',
    'search': '🔍',
    'filter': '🔽',
    'sort': '↕️',
    
    // Status icons
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️',
    'loading': '⏳',
    
    // Study icons
    'book': '📚',
    'brain': '🧠',
    'target': '🎯',
    'star': '⭐',
    'trophy': '🏆',
    'clock': '⏰',
    'calendar': '📅'
  }

  const icon = iconMap[name] || '❓'
  const sizeClass = sizeClasses[size] || ''

  return (
    <span className={`${sizeClass} ${className}`} style={{ color }}>
      {icon}
    </span>
  )
}

export default Icon
