import { addToast } from '@heroui/react';

export const toast = {
  success: (title: string, description?: string) => addToast({ title, description, color: 'success', variant: 'flat', timeout: 4000 }),
  error: (title: string, description?: string) => addToast({ title, description, color: 'danger', variant: 'flat', timeout: 6000 }),
  info: (title: string, description?: string) => addToast({ title, description, color: 'primary', variant: 'flat', timeout: 4000 }),
};
