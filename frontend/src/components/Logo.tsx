import { useId } from 'react';
import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <path d="M9 10h14v3.4h-5.2V23h-3.6v-9.6H9z" fill="#ffffff" />
    </svg>
  );
}

interface LogoProps { href?: string; size?: 'md' | 'lg'; light?: boolean }

export default function Logo({ href = '/', size = 'md', light = false }: LogoProps) {
  return (
    <Link to={href} className="flex items-center gap-2.5 font-semibold tracking-tight" aria-label="Techvoto home">
      <LogoMark className={size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'} />
      <span className={`${size === 'lg' ? 'text-2xl' : 'text-[1.15rem]'} ${light ? 'text-white' : 'text-foreground'}`}>Techvoto</span>
    </Link>
  );
}
