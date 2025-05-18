import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative',
  {
    variants: {
      variant: {
        default: 'bg-[#0074c2] text-white shadow-lg', // removed active:scale and hover/focus/active classes
        destructive: 'bg-[#ff4d4f] text-white shadow-lg',
        outline: 'border-2 border-[#0074c2] text-[#0074c2] bg-white',
        secondary: 'bg-[#39b54a] text-white shadow-lg',
        ghost: 'bg-[#e6f7ff] text-[#0074c2]', // use a light bg instead of transparent for permanent visibility
        link: 'text-[#0074c2] underline underline-offset-4',
        gradient: 'bg-gradient-to-r from-[#0074c2] to-[#39b54a] text-white shadow-lg',
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
    loading && 'relative text-transparent cursor-wait' // Ensure 'loading' doesn't hide text
  )}
  disabled={loading || props.disabled}
  ref={ref}
  {...props}
>
  {children} {/* Show children directly without hiding */}
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )}
</Comp>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
