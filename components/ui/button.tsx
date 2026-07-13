import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-semibold tracking-[0.01em] ring-offset-cherie-ivory transition-[transform,box-shadow,background-color,border-color,color] duration-control ease-cherie active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-cherie-burgundy text-cherie-ivory shadow-[0_8px_24px_rgba(74,14,23,0.18)] hover:-translate-y-0.5 hover:bg-cherie-cherry hover:shadow-[0_12px_30px_rgba(74,14,23,0.24)]',
        secondary:
          'border border-cherie-burgundy/55 bg-cherie-ivory/40 text-cherie-burgundy hover:-translate-y-0.5 hover:border-cherie-burgundy hover:bg-cherie-paper',
        ghost: 'bg-transparent text-cherie-ink hover:bg-cherie-paper/80',
        link: 'text-cherie-burgundy underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2', // 44px min target (docs/31)
        sm: 'h-10 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
