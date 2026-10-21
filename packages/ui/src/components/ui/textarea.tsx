import * as React from 'react';
import { cn } from '../../lib/cn';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content border-input text-body placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-body dark:bg-input/30 dark:aria-invalid:ring-destructive/40 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
