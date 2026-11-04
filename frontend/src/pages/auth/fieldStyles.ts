import type { InputProps } from '@heroui/react';

/** Shared look for every field on the auth pages: roomy, one clean border, one focus ring. */
export const authInput: InputProps['classNames'] = {
  base: 'gap-2',
  label: 'text-sm font-medium text-foreground',
  inputWrapper:
    'h-12 rounded-lg border-small border-default-300 bg-content1 px-4 shadow-none transition-colors ' +
    'data-[hover=true]:border-default-400 group-data-[focus=true]:border-primary group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20',
  input: 'text-sm placeholder:text-default-400',
  description: 'mt-1 text-xs text-default-500',
};