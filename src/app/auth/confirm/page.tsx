'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function confirm() {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (tokenHash && type) {
        // Supabase PKCE flow — verifyOtp
        const db = getClient();
        const { error } = await db.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'signup' | 'recovery' | 'email',
        });
        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          setTimeout(() => router.push('/parent'), 1500);
        }
        return;
      }

      // Fallback: session already in hash (implicit flow)
      const db = getClient();
      const { data } = await db.auth.getSession();
      if (data.session) {
        setStatus('success');
        setTimeout(() => router.push('/parent'), 1000);
      } else {
        setStatus('error');
        setMessage('Lien invalide ou expiré. Veuillez vous reconnecter.');
      }
    }
    confirm();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-50">
      {status === 'loading' && (
        <>
          <div className="text-4xl mb-4 animate-pulse">✉️</div>
          <p className="text-slate-500 text-sm">Validation du compte en cours…</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-black text-[#1a1a2e]">Compte activé !</h2>
          <p className="text-slate-500 text-sm mt-2">Redirection vers votre espace parent…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-black text-[#1a1a2e]">Lien invalide</h2>
          <p className="text-slate-500 text-sm mt-2">{message}</p>
          <button onClick={() => router.push('/auth')}
            className="mt-5 rounded-2xl bg-violet-600 text-white font-bold px-6 py-3 hover:bg-violet-700 transition-colors text-sm">
            Retour à la connexion
          </button>
        </>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Chargement…
      </div>
    }>
      <ConfirmInner />
    </Suspense>
  );
}
