import { forwardRef } from 'react';

const Input = forwardRef(
  ({ 
    label,
    error,
    touched,
    icon: Icon,
    placeholder,
    type = 'text',
    required = false,
    description,
    disabled = false,
    className = '',
    ...props 
  }, ref) => {
    const hasError = touched && error;
    
    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label 
              htmlFor={props.id}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {description && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
            )}
          </div>
        )}
        
        <div className="relative group">
          {Icon && (
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-normal" />
          )}
          
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-4 py-2.5 font-medium
              ${Icon ? 'pl-12' : ''}
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700
              rounded-lg
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              
              transition-all duration-normal
              
              focus:outline-none 
              focus:border-cyan-500 dark:focus:border-cyan-400
              focus:ring-2 focus:ring-cyan-500/20
              
              hover:border-gray-400 dark:hover:border-gray-600
              
              disabled:opacity-60 disabled:cursor-not-allowed
              disabled:bg-gray-100 dark:disabled:bg-gray-900
              
              ${hasError ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20' : ''}
              
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${props.id}-error` : props['aria-describedby']}
            {...props}
          />
        </div>
        
        {hasError && (
          <p 
            id={`${props.id}-error`}
            className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
