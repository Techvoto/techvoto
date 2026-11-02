import { Link } from 'react-router-dom';
import Logo from './Logo';

const COLS: [title: string, items: [label: string, href: string][]][] = [
  ['Learn', [['Browse courses', '/courses'], ['Live classes', '/#live'], ['How it works', '/#how'], ['Verify a certificate', '/verify']]],
  ['Account', [['Sign in', '/login'], ['Create account', '/register'], ['Reset password', '/forgot-password']]],
  ['Company', [['Contact us', '/contact'], ['Terms of service', '/terms'], ['Privacy policy', '/privacy']]],
];

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-divider bg-content1">
      <div className="mx-auto grid max-w-page gap-10 px-6 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-default-500">Expert-led courses, live classes and verifiable certificates, built for how people actually learn.</p>
        </div>
        {COLS.map(([title, items]) => (
          <nav key={title} aria-label={title}>
            <p className="mb-3 text-sm font-semibold">{title}</p>
            <ul className="space-y-2 text-sm text-default-600">
              {items.map(([label, href]) => <li key={href}><Link to={href} className="hover:text-primary hover:underline">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-divider">
        <p className="mx-auto max-w-page px-6 py-5 text-xs text-default-500">© {new Date().getFullYear()} Techvoto. All rights reserved.</p>
      </div>
    </footer>
  );
}
