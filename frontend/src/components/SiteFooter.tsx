import { Link } from 'react-router-dom';
import Logo from './Logo';

const COLS: [title: string, items: [label: string, href: string][]][] = [
  ['Learn', [['Browse courses', '/courses'], ['Live classes', '/#live'], ['How it works', '/#how'], ['Verify a certificate', '/verify']]],
  ['Account', [['Sign in', '/login'], ['Create account', '/register'], ['Reset password', '/forgot-password']]],
  ['Company', [['Contact us', '/contact'], ['Terms of service', '/terms'], ['Privacy policy', '/privacy']]],
];

export default function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-divider bg-content1">
      <div className="mx-auto grid max-w-page gap-10 px-6 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-default-500">
            Expert-led courses, live classes and verifiable certificates, built for how people actually learn.
          </p>
        </div>
        {COLS.map(([title, items]) => (
          <nav key={title} aria-label={title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-default-500">{title}</p>
            <ul className="space-y-2.5 text-sm">
              {items.map(([label, href]) => (
                <li key={href}><Link to={href} className="text-default-700 transition-colors hover:text-primary">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-divider">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-default-500">
          <p>© {new Date().getFullYear()} Techvoto. All rights reserved.</p>
          <p>Learn. Practise. Get certified.</p>
        </div>
      </div>
    </footer>
  );
}
