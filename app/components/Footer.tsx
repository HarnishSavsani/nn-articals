import Link from 'next/link';

const resourceLinks = [
  { href: '/', label: 'Home' },
  { href: '/share', label: 'Share Insights' },
  { href: '#', label: 'Categories' },
  { href: '#', label: 'About' },
];

const companyLinks = [
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Terms of Service' },
  { href: '#', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/logo-light.svg"
                alt="NexusShare"
                className="h-6 block dark:hidden"
              />
              <img
                src="/logo-dark.svg"
                alt="NexusShare"
                className="h-6 hidden dark:block"
              />
            </div>
            <p className="mb-4 text-sm text-muted leading-relaxed">
              Your team&apos;s knowledge hub. Explore curated insights, best
              practices, and resources shared by colleagues across the
              organization.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} NexusShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
