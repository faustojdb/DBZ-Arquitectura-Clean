import React, { useState, useEffect } from 'react';

interface NumericInputProps {
  /**
   * Current value
   */
  value: string;
  
  /**
   * Callback when value changes
   */
  onChange: (value: string) => void;
  
  /**
   * Minimum allowed value
   */
  min?: number;
  
  /**
   * Maximum allowed value
   */
  max?: number;
  
  /**
   * Step increment/decrement
   */
  step?: string;
  
  /**
   * CSS class names
   */
  className?: string;
  
  /**
   * Additional props
   */
  [key: string]: any;
}

/**
 * NumericInput component that ensures valid numeric values
 */
const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = "1",
  className = "w-full rounded border px-2 py-1 text-right",
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string or valid number
    if (newValue === '' || (!isNaN(parseFloat(newValue)) && isFinite(Number(newValue)))) {
      setLocalValue(newValue);
      
      // Check min/max constraints if needed
      const numValue = parseFloat(newValue);
      if (newValue === '' || isNaN(numValue)) {
        onChange(newValue);
      } else {
        let validValue = numValue;
        
        if (min !== undefined && numValue < min) {
          validValue = min;
        }
        
        if (max !== undefined && numValue > max) {
          validValue = max;
        }
        
        onChange(validValue.toString());
      }
    }
  };

  // Handle blur event to format and validate
  const handleBlur = () => {
    if (localValue === '') {
      // If empty and min is set, use min
      if (min !== undefined) {
        setLocalValue(min.toString());
        onChange(min.toString());
      } else {
        setLocalValue('0');
        onChange('0');
      }
    } else {
      // Ensure value is within constraints
      const numValue = parseFloat(localValue);
      let validValue = numValue;
      
      if (min !== undefined && numValue < min) {
        validValue = min;
      }
      
      if (max !== undefined && numValue > max) {
        validValue = max;
      }
      
      setLocalValue(validValue.toString());
      onChange(validValue.toString());
    }
  };

  return (
    <input
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      className={className}
      {...props}
    />
  );
};

export default NumericInput;