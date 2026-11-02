import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from '@heroui/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import GlobalSearch from './GlobalSearch';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const links: [label: string, href: string][] = [['Courses', '/courses'], ['Live classes', '/#live'], ['How it works', '/#how'], ['Verify certificate', '/verify'], ['Contact', '/contact']];

export default function SiteNavbar() {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <Navbar isBordered maxWidth="xl" height="4rem" isMenuOpen={open} onMenuOpenChange={setOpen} className="bg-content1/90 backdrop-blur">
      <NavbarContent justify="start" className="gap-2">
        <NavbarMenuToggle aria-label="Toggle menu" className="md:hidden" />
        <NavbarBrand><Logo /></NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden gap-1 md:flex" justify="center">
        {links.map(([label, href]) => (
          <NavbarItem key={href} isActive={pathname === href}>
            <Link to={href} className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-default-100 ${pathname === href ? 'text-primary' : 'text-default-700'}`}>{label}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end" className="gap-1">
        <NavbarItem><GlobalSearch /></NavbarItem>
        <NavbarItem><ThemeToggle /></NavbarItem>
        {!loading && (user ? (
          <NavbarItem><Button as={Link} to="/dashboard" color="primary">Go to dashboard</Button></NavbarItem>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex"><Button as={Link} to="/login" variant="light" className="font-medium">Sign in</Button></NavbarItem>
            <NavbarItem><Button as={Link} to="/register" color="primary">Join for free</Button></NavbarItem>
          </>
        ))}
      </NavbarContent>
      <NavbarMenu className="gap-1 pt-4">
        {links.map(([label, href]) => (
          <NavbarMenuItem key={href}><Link to={href} className="block w-full rounded-md px-2 py-2.5 text-base font-medium" onClick={() => setOpen(false)}>{label}</Link></NavbarMenuItem>
        ))}
        {!user && <NavbarMenuItem><Link to="/login" className="block w-full rounded-md px-2 py-2.5 text-base font-medium" onClick={() => setOpen(false)}>Sign in</Link></NavbarMenuItem>}
      </NavbarMenu>
    </Navbar>
  );
}
