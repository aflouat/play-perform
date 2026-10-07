import Link from 'next/link';

/** Current app version (from package.json at build time), linking to the release notes. */
export function AppVersion({ className = '' }: { className?: string }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
  return (
    <Link href="/releases" className={`font-mono ${className}`} aria-label={`Version ${version}, voir les notes de version`}>
      v{version}
    </Link>
  );
}
