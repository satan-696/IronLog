// web/src/components/ui/SegmentedControl.jsx
export default function SegmentedControl({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`inline-flex bg-surface2 border border-border rounded-button p-1 gap-1 ${className}`}>
      {options.map(opt => {
        const optVal   = typeof opt === 'string' ? opt : opt.value;
        const optLabel = typeof opt === 'string' ? opt : opt.label;
        const active   = optVal === value;
        return (
          <button
            key={optVal}
            type="button"
            onClick={() => onChange(optVal)}
            className={[
              'px-4 py-1.5 rounded-[6px] text-sm font-medium font-body transition-all duration-150',
              active
                ? 'bg-accent text-bg shadow-sm'
                : 'text-text2 hover:text-text1',
            ].join(' ')}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}
