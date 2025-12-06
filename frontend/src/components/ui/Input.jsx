import React from 'react'

const Input = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
        focus:border-sky-blue focus:outline-none focus:ring-2 focus:ring-sky-blue/20
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      {...props}
    />
  )
}

export default Input