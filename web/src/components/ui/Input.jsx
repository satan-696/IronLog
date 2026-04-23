// web/src/components/ui/Input.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  id,
  ...props
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-text2 text-sm font-medium font-body">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={[
            'w-full h-[52px] px-4 rounded-button font-body text-text1',
            'bg-surface2 border transition-colors duration-150',
            'placeholder:text-textMuted',
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-accent',
            'outline-none',
            (isPassword || Icon) ? 'pr-12' : '',
          ].join(' ')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text2 hover:text-text1 transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {Icon && !isPassword && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text2 pointer-events-none">
            <Icon size={18} />
          </span>
        )}
      </div>
      {error && <p className="text-danger text-xs font-body">{error}</p>}
    </div>
  );
}
