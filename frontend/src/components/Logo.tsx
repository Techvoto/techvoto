import { Link } from 'react-router-dom';

/** Files in /public. Change the extension here if yours are .png. */
const LOGO_FOR_LIGHT_MODE = '/techvoto-logo-dark.png';   // dark logo, shown on light backgrounds
const LOGO_FOR_DARK_MODE = '/techvoto-logo-white.png';   // white logo, shown on dark backgrounds

interface LogoProps { href?: string; size?: 'md' | 'lg'; light?: boolean }

/**
 * Header logo. `light` forces the white version, for use on the dark brand panel
 * (login and register side panel), which is dark in both themes.
 */
export default function Logo({ href = '/', size = 'md', light = false }: LogoProps) {
  const height = size === 'lg' ? 'h-10' : 'h-8';
  return (
    <Link to={href} className="flex items-center" aria-label="Techvoto home">
      {light ? (
        <img src={LOGO_FOR_DARK_MODE} alt="Techvoto" className={`${height} w-auto`} />
      ) : (
        <>
          <img src={LOGO_FOR_LIGHT_MODE} alt="Techvoto" className={`${height} w-auto dark:hidden`} />
          <img src={LOGO_FOR_DARK_MODE} alt="" aria-hidden="true" className={`${height} hidden w-auto dark:block`} />
        </>
      )}
    </Link>
  );
}