'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { IconSun, IconMoon } from './Icons';

export default function Header() {
  const { theme, mounted, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/share', label: 'Share Insights' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            {/* CSS-based logo toggle — no hydration flash */}
            <img
              src="/logo-light.svg"
              alt="NexusShare"
              className="h-8 block dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="NexusShare"
              className="h-8 hidden dark:block"
            />
          </Link>
          <span className="hidden border-l border-border pl-3 text-sm text-muted sm:inline">
            Knowledge Base
          </span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'font-medium text-foreground border-b-2 border-nexus-500 pb-0.5'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />
            ) : (
              <span className="inline-block h-[18px] w-[18px]" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
