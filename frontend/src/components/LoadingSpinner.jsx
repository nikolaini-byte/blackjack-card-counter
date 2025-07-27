import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue-500', 
  className = '',
  text = 'Loading...',
  showText = true
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div 
          className={`
            ${sizeClasses[size] || sizeClasses['md']}
            border-${color}/20
            rounded-full
            animate-spin
          `}
          style={{
            borderTopColor: `var(--color-${color})`,
            borderRightColor: `var(--color-${color})`,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent'
          }}
        >
          <span className="sr-only">{text}</span>
        </div>
        
        {/* Optional: Add a smaller inner spinner for a more polished look */}
        {['lg', 'xl'].includes(size) && (
          <div 
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              ${size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'}
              border-2 border-${color}/30
              rounded-full
              animate-spin
            `}
            style={{
              animationDirection: 'reverse',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: `var(--color-${color})`,
              borderLeftColor: `var(--color-${color})`
            }}
          />
        )}
      </div>
      
      {showText && text && (
        <span className={`mt-2 text-${color} ${textSizes[size] || textSizes['md']} font-medium`}>
          {text}
        </span>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  className: PropTypes.string,
  text: PropTypes.string,
  showText: PropTypes.bool
};

export default LoadingSpinner;
