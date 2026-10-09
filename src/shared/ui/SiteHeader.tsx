import Link from 'next/link';

const LINKS = [
  { href: '/apprenant', label: 'Espace apprenant' },
  { href: '/enseignant', label: 'Espace enseignant' },
  { href: '/faq', label: 'FAQ' },
] as const;

/** Public site header, shown on every page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-black tracking-tight text-[#1a1a2e]">🏰 Play Perform</Link>
        <nav aria-label="Navigation principale" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-semibold text-slate-600">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="hover:text-violet-600">{l.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
