import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  ariaLabel
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value).replace('.', ','));

  useEffect(() => {
    // Sync from parent if value changes programmatically (e.g., loading a snapshot or resetting).
    // This check prevents reformatting while the user is typing, e.g., "150,".
    const currentNumericValue = parseFloat(inputValue.replace(',', '.')) || 0;
    if (currentNumericValue !== value) {
      setInputValue(String(value).replace('.', ','));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow only digits and a single comma.
    let sanitizedValue = rawValue.replace(/[^0-9,]/g, '');
    const commaIndex = sanitizedValue.indexOf(',');
    if (commaIndex !== -1) {
      sanitizedValue = sanitizedValue.slice(0, commaIndex + 1) + sanitizedValue.slice(commaIndex + 1).replace(/,/g, '');
    }
    
    setInputValue(sanitizedValue);
    
    const numericValue = parseFloat(sanitizedValue.replace(',', '.')) || 0;
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
    />
  );
};

export default CurrencyInput;