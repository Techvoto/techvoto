import { Button } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === 'dark';
  return (
    <Button isIconOnly variant="light" radius="full" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onPress={() => setTheme(dark ? 'light' : 'dark')}>
      {mounted ? (dark ? <Sun size={18} /> : <Moon size={18} />) : <span className="h-[18px] w-[18px]" />}
    </Button>
  );
}
