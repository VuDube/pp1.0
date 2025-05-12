
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-payper-blue-default text-white hover:bg-payper-blue-dark active:scale-[0.98] shadow-lg hover:shadow-xl',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] shadow-lg hover:shadow-xl',
        outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
        secondary: 'bg-payper-green-default text-white hover:bg-payper-green-dark active:scale-[0.98] shadow-lg hover:shadow-xl',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'payper-gradient-bg text-white hover:opacity-90 active:scale-[0.98] shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        xl: 'h-12 rounded-md px-8 text-lg',
        icon: 'h-10 w-10',
        full: 'h-12 w-full px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false,
  loading = false,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : 'button';
  
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && 'relative text-transparent hover:text-transparent cursor-wait'
      )}
      disabled={loading || props.disabled}
      ref={ref}
      {...props}
    >
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
