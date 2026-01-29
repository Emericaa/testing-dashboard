import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          variant === 'primary' && 'bg-brand-500 text-white hover:bg-brand-700',
          variant === 'secondary' && 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
          variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
          size === 'sm' && 'h-8 px-3',
          size === 'md' && 'h-10 px-4',
          size === 'lg' && 'h-12 px-5',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
