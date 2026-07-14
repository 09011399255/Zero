import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordStrength } from '../../lib/password';

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  // When true, renders a strength meter below the field (for create/reset flows).
  showStrength?: boolean;
  id?: string;
}

const BAR_COLORS = ['bg-surface-border', 'bg-status-danger', 'bg-status-warning', 'brand', 'bg-status-success'];
const LABEL_COLORS: Record<string, string> = {
  'Too short': 'text-text-muted',
  Weak: 'text-status-danger',
  Fair: 'text-status-warning',
  Good: 'text-brand-600',
  Strong: 'text-status-success',
};

export function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  required,
  minLength,
  autoComplete,
  showStrength,
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full p-3 pr-11 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition duration-150"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => {
              const filled = strength.score >= i;
              const color = BAR_COLORS[strength.score];
              return (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition duration-200 ${
                    filled ? (color === 'brand' ? 'bg-brand-500' : color) : 'bg-surface-border'
                  }`}
                />
              );
            })}
          </div>
          <p className={`text-[10px] font-semibold ${LABEL_COLORS[strength.label]}`}>{strength.label}</p>
        </div>
      )}
    </div>
  );
}
