import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Play & Perform',
  description: 'Toutes les règles et fonctionnalités de la plateforme Play & Perform',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-black text-[#1a1a2e] mb-4 pb-2 border-b border-slate-200">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold text-[#1a1a2e] mb-1.5">❓ {q}</p>
      <div className="text-slate-600 text-sm leading-relaxed pl-5">{children}</div>
    </div>
  );
}

function Table({ rows }: { rows: string[][] }) {
  const [headers, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-slate-600 text-xs">{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 text-sm mb-8 hover:text-slate-600 transition-colors">← Retour</Link>
        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight mb-2">FAQ — Play & Perform</h1>
          <p className="text-slate-500">Guide complet pour tirer le maximum de la plateforme.</p>
        </header>

        <Section title="1. Les profils">
          <Q q="Quels profils sont disponibles ?">
            <Table rows={[['Profil','Âge','Activité','Route'],['🧑‍🎓 Omar','12 ans','Quiz 14 matières','/home → /quiz'],['🌸 Esma','9 ans','Mots FR / EN / ES','/esma'],['🚀 Mohamed','6 ans','Clavier, Mots, Sciences','/keyboard']]} />
          </Q>
          <Q q="Le profil est-il sauvegardé entre les sessions ?">Oui. Score et profil mémorisés en localStorage, synchronisés avec Supabase en arrière-plan.</Q>
          <Q q="Comment revenir à la sélection ?">Flèche ← en haut à gauche.</Q>
        </Section>

        <Section title="2. Score et XP">
          <Q q="Comment fonctionne l'XP ?">
            <Table rows={[['Action','XP'],['Bonne réponse (Initié)','10'],['Bonne réponse (Apprenti)','15'],['Bonne réponse (Expert)','20'],['Bonne réponse (Gourou)','30'],['Quiz parfait','+20 bonus'],['Réponse rapide','jusqu\'à 100% du XP de base']]} />
          </Q>
          <Q q="Comment progresser en niveaux ?"><strong>100 XP = 1 niveau</strong>. La barre dorée dans le header montre la progression. XP décroissants selon le temps (sablier 30s).</Q>
          <Q q="Quels badges peut-on débloquer ?">
            <Table rows={[['Badge','Condition'],['🎯 Premier Quiz','Premier gain d\'XP'],['⭐ Quiz parfait','Toutes correctes en une session'],['🔍 Chercheur·euse','500 XP cumulés']]} />
          </Q>
        </Section>

        <Section title="3. Avatars">
          <Q q="Quels avatars sont disponibles ?">
            <Table rows={[['Avatar','XP requis'],['🧑‍🚀 Astronaute','0'],['🧪 Scientifique','0'],['🥷 Ninja','0'],['🗺️ Explorateur','100'],['🧙 Sorcier','250'],['🤖 Robot','500']]} />
          </Q>
        </Section>

        <Section title="4. Modes Assisté / Avancé">
          <Q q="Quelle est la différence ?">
            <Table rows={[['Mode','Effet'],['🚀 Avancé','Travail autonome, pas d\'aide'],['🤝 Assisté','Question lue auto, bouton 💡 indice actif']]} />
          </Q>
        </Section>

        <Section title="5. Répétition espacée (SM-2)">
          <Q q="Comment fonctionne la courbe de l'oubli ?">
            <Table rows={[['Situation','Prochain affichage'],['1ère bonne réponse','J+3'],['2ème bonne réponse','J+7'],['3ème+ correcte','Intervalle × facteur de facilité'],['Réponse fausse','Prochaine session'],['Maîtrisé (≥ 21j)','En dernier recours']]} />
          </Q>
        </Section>

        <Section title="6. Les matières (Omar — 14)">
          <Q q="Combien de questions par session ?"><strong>5 questions</strong> sélectionnées par SRS.</Q>
          <Q q="4 niveaux de difficulté">🌱 Initié → 📖 Apprenti → ⚡ Expert → 🔥 Gourou</Q>
        </Section>

        <Section title="7. Astuces">
          <Q q="Comment progresser le plus vite ?">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Sessions Sciences Mohamed (15 XP × 5 = 75 XP)</li>
              <li>Quiz parfaits Omar (+20 XP bonus)</li>
              <li>Répondre rapidement (sablier = XP maximum)</li>
            </ol>
          </Q>
          <Q q="La plateforme fonctionne-t-elle hors connexion ?">Oui — toute la logique est côté client.</Q>
          <Q q="Comment réinitialiser le SRS ?">
            Console : <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{`localStorage.removeItem('srs:omar:maths')`}</code>
          </Q>
        </Section>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
          <p className="text-slate-400 text-xs">Play & Perform · v0.5.0</p>
          <Link href="/" className="mt-3 inline-flex rounded-xl bg-sky-500 text-white font-bold px-5 py-2.5 text-sm hover:bg-sky-400 transition-colors">
            Commencer à jouer →
          </Link>
        </div>
      </div>
    </div>
  );
}
