/**
 * @file Badge 컴포넌트
 * @description 상태 표시용 배지 컴포넌트
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          {
            'border-transparent bg-primary text-primary-foreground hover:bg-primary/80': variant === 'default' || variant === 'primary',
            'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80': variant === 'destructive' || variant === 'danger',
            'border-transparent bg-success-500 text-white hover:bg-success-600': variant === 'success',
            'border-transparent bg-warning-500 text-white hover:bg-warning-600': variant === 'warning',
            'border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'text-foreground': variant === 'outline',
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-0.5 text-xs': size === 'md',
            'px-3 py-1 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };






