// web/src/components/ui/Stepper.jsx
import { Minus, Plus } from 'lucide-react';

export default function Stepper({ value, onChange, min = 1, max = 100, label, className = '' }) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-text2 text-sm font-medium font-body">{label}</span>}
      <div className="inline-flex items-center gap-0 border border-border rounded-button overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="w-10 h-10 flex items-center justify-center text-text2 hover:text-accent hover:bg-surface2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 h-10 flex items-center justify-center text-text1 font-display text-lg bg-surface2 select-none">
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-10 h-10 flex items-center justify-center text-text2 hover:text-accent hover:bg-surface2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
