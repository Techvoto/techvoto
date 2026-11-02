import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <path d="M9 10h14v3.4h-5.2V23h-3.6v-9.6H9z" className="fill-primary-foreground" />
    </svg>
  );
}

export default function Logo({ href = '/', size = 'md' }: { href?: string; size?: 'md' | 'lg' }) {
  return (
    <Link to={href} className="flex items-center gap-2.5 font-semibold tracking-tight" aria-label="Techvoto home">
      <LogoMark className={size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'} />
      <span className={size === 'lg' ? 'text-2xl' : 'text-[1.15rem]'}>Techvoto</span>
    </Link>
  );
}
