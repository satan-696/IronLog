// web/src/components/ui/Badge.jsx
const variants = {
  lime:    'bg-accent/15 border border-accent text-accent',
  red:     'bg-danger/15 border border-danger text-danger',
  gray:    'bg-border text-text2 border border-transparent',
  warning: 'bg-warning/15 border border-warning text-warning',
  success: 'bg-success/15 border border-success text-success',
};

export default function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-body',
        variants[variant] || variants.gray,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
