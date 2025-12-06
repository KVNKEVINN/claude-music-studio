import React from 'react'

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-deep-indigo text-white hover:bg-deep-indigo/90 focus:ring-deep-indigo',
    secondary: 'bg-sky-blue text-white hover:bg-sky-blue/90 focus:ring-sky-blue',
    outline: 'border-2 border-deep-indigo text-deep-indigo hover:bg-deep-indigo hover:text-white focus:ring-deep-indigo',
    ghost: 'text-deep-indigo hover:bg-deep-indigo/10 focus:ring-deep-indigo',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }
  
  const disabledStyles = 'opacity-50 cursor-not-allowed'
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button