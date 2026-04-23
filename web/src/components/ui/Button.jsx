// web/src/components/ui/Button.jsx
import { forwardRef } from 'react';

const variants = {
  primary:   'bg-accent text-bg font-display tracking-wider hover:brightness-110 active:scale-[0.97]',
  secondary: 'border border-accent text-accent bg-transparent hover:bg-accent/10 active:scale-[0.97]',
  ghost:     'text-text2 hover:text-text1 hover:bg-surface2 active:scale-[0.97]',
  danger:    'bg-danger/20 border border-danger text-danger hover:bg-danger/30 active:scale-[0.97]',
};

const sizes = {
  sm: 'h-9  px-4 text-sm  rounded-lg',
  md: 'h-[52px] px-6 text-base rounded-button',
  lg: 'h-14 px-8 text-lg rounded-button',
};

const Button = forwardRef(({
  variant = 'primary',
  size    = 'md',
  className = '',
  disabled,
  loading,
  fullWidth,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-body font-medium',
        'transition-all duration-150 select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant] || variants.primary,
        sizes[size]       || sizes.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
