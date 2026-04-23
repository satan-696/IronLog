// web/src/components/ui/Avatar.jsx
const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div
      className={[
        'rounded-full bg-accent text-bg font-display flex items-center justify-center select-none flex-shrink-0',
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}
