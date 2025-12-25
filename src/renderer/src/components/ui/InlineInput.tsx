import { useState, useEffect, useRef } from 'react';

interface InlineInputProps {
  value: string;
  placeholder?: string;
  className: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  fullWidth?: boolean;
}

export const InlineInput =
  ({ value, placeholder, className, onSave, onCancel, fullWidth }: InlineInputProps) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      onSave(tempValue);
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${fullWidth ? 'w-full' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className={`inline-grid items-center ${fullWidth ? 'w-full' : ''}`}>
        {/* Invisible spacer to set width */}
        <span className="col-start-1 row-start-1 opacity-0 px-2 py-0.5 whitespace-pre pointer-events-none font-medium text-sm">
          {tempValue || placeholder || "Placeholder"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={tempValue}
          placeholder={placeholder}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => onSave(tempValue)}
          className={`col-start-1 row-start-1 focus:outline-none ${className} ${fullWidth ? 'w-full' : ''}`}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
