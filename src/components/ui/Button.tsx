import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50',
        variant === 'primary' && 'bg-green text-bg',
        variant === 'secondary' && 'bg-card2 text-text border border-border',
        variant === 'ghost' && 'bg-transparent text-muted',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-3 text-base',
        size === 'lg' && 'px-6 py-4 text-lg w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
