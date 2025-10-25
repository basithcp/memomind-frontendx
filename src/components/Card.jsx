import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  title, 
  subtitle,
  header,
  footer,
  ...props 
}) => {
  return (
    <div className={`card card-custom ${className}`} {...props}>
      {header && (
        <div className="card-header">
          {header}
        </div>
      )}
      
      {title && (
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
