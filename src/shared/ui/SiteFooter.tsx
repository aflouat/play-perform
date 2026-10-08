import Link from 'next/link';
import { AppVersion } from './AppVersion';

/** Public site footer: useful links + app version. */
export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Play Perform · Centre de formation</p>
        <nav aria-label="Liens du pied de page" className="flex items-center gap-5">
          <Link href="#tarifs" className="hover:text-slate-900">Tarifs</Link>
          <Link href="/faq" className="hover:text-slate-900">FAQ</Link>
          <Link href="/confidentialite" className="hover:text-slate-900">Confidentialité</Link>
          <Link href="/releases" className="hover:text-slate-900">Versions</Link>
          <AppVersion className="text-slate-500 hover:text-slate-900" />
        </nav>
      </div>
    </footer>
  );
}
