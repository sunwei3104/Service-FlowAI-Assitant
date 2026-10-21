import * as React from 'react';
import { cn } from '../../lib/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input text-body selection:bg-primary selection:text-primary-foreground file:text-body file:text-foreground placeholder:text-muted-foreground md:text-body dark:bg-input/30 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-sm outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
