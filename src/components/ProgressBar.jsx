import React from 'react'

const ProgressBar = ({ 
  progress = 0, 
  max = 100, 
  showLabel = true, 
  label = null,
  className = '',
  animated = false,
  striped = false
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100)
  
  const progressClasses = [
    'progress-bar',
    'progress-bar-custom',
    animated ? 'progress-bar-animated' : '',
    striped ? 'progress-bar-striped' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={`progress ${className}`}>
      <div 
        className={progressClasses}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax={max}
      >
        {showLabel && (label || `${Math.round(percentage)}%`)}
      </div>
    </div>
  )
}

export default ProgressBar
