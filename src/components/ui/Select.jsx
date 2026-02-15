import { forwardRef, useState } from 'react';

const Select = forwardRef(
  ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error,
    touched,
    className = '',
    ...props
  }, ref) => {
    const hasError = touched && error;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5
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
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

Select.displayName = 'Select';
export default Select;
