// web/src/components/ui/Card.jsx
export default function Card({ children, active, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-surface rounded-card p-4',
        active
          ? 'border-l-[3px] border-l-accent border border-border/50'
          : 'border border-border',
        onClick ? 'cursor-pointer hover:border-border/80 transition-colors' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
