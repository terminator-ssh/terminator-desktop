import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from "./button";

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const PasswordInput = ({ value, onChange, placeholder, className }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-input border border-border text-foreground text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary pr-10 ${className}`}
      />
      <Button type="button" variant="ghost" size="icon-sm"
              onClick={() => setShow(!show)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground"
              tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
    </div>
  );
};
