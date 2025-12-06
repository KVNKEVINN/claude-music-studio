import React from 'react'

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  className = '',
  showPercentage = false,
  ...props 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-text-muted">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-sky-blue h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar