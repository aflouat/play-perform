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

        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 text-sm mb-8 hover:text-slate-600 transition-colors">
          ← Retour à l'accueil
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight mb-2">
            FAQ — Play & Perform
          </h1>
          <p className="text-slate-500">Guide complet pour tirer le maximum de la plateforme.</p>
        </header>

        <Section title="1. Les profils">
          <Q q="Quels profils sont disponibles ?">
            <Table rows={[
              ['Profil', 'Âge', 'Activité', 'Route'],
              ['🧑‍🎓 Omar', '12 ans', 'Quiz 14 matières', '/home → /quiz'],
              ['🌸 Esma', '9 ans', 'Mots FR / EN / ES', '/esma'],
              ['🚀 Mohamed', '6 ans', 'Clavier, Mots, Sciences', '/keyboard'],
            ]} />
          </Q>
          <Q q="Le profil est-il sauvegardé entre les sessions ?">
            Oui. Le profil actif et le score sont mémorisés dans le navigateur (localStorage). Les scores sont aussi synchronisés en arrière-plan avec la base de données cloud.
          </Q>
          <Q q="Comment revenir à l'écran de sélection ?">
            Appuyez sur la flèche <strong>←</strong> en haut à gauche de n'importe quelle page.
          </Q>
        </Section>

        <Section title="2. Score et XP">
          <Q q="Comment fonctionne l'XP ?">
            <Table rows={[
              ['Action', 'XP'],
              ['Bonne réponse quiz (facile)', '10 XP'],
              ['Bonne réponse quiz (moyen)', '15 XP'],
              ['Bonne réponse quiz (difficile)', '20 XP'],
              ['Quiz parfait (toutes bonnes)', '+20 XP bonus'],
              ['Lettre clavier Mohamed', '5 XP'],
              ['Mot complet Mohamed', '10 XP'],
              ['Question science Mohamed', '15 XP'],
              ['Mot Esma', '8 XP'],
            ]} />
          </Q>
          <Q q="Comment progresser en niveaux ?">
            <strong>100 XP = 1 niveau</strong> (linéaire). La barre dorée dans le header montre la progression.
            Le badge <strong>+N XP</strong> flotte à l'écran à chaque gain.
          </Q>
          <Q q="Quels badges peut-on débloquer ?">
            <Table rows={[
              ['Badge', 'Condition'],
              ['🎯 Premier Quiz', 'Premier gain d\'XP'],
              ['⭐ Quiz parfait', 'Toutes les réponses correctes en une session'],
              ['🔍 Chercheur·euse', '500 XP cumulés au total'],
              ['🔥 3 jours de suite', 'Streak (à venir)'],
              ['⚡ Une semaine !', 'Streak 7 jours (à venir)'],
            ]} />
          </Q>
        </Section>

        <Section title="3. Avatars">
          <Q q="Quels avatars sont disponibles et quand se débloquent-ils ?">
            <Table rows={[
              ['Avatar', 'XP requis'],
              ['🧑‍🚀 Astronaute', '0 XP (dès le début)'],
              ['🧪 Scientifique', '0 XP (dès le début)'],
              ['🥷 Ninja', '0 XP (dès le début)'],
              ['🗺️ Explorateur·ice', '100 XP'],
              ['🧙 Sorcier·ère', '250 XP'],
              ['🤖 Robot', '500 XP'],
            ]} />
            Un avatar verrouillé affiche 🔒 et l'XP requis. Il se déverrouille automatiquement.
          </Q>
        </Section>

        <Section title="4. Modes Assisté / Avancé">
          <Q q="Quelle est la différence entre les deux modes ?">
            <Table rows={[
              ['Mode', 'Ce qui change'],
              ['🚀 Avancé (défaut Omar & Mohamed)', 'Travail autonome, pas d\'aide automatique'],
              ['🤝 Assisté (défaut Esma)', 'Question lue automatiquement, emoji agrandi, bouton 💡 Indice actif'],
            ]} />
          </Q>
          <Q q="Que fait le bouton 💡 Indice ?">
            <strong>1 indice par question</strong>, non rechargeable.
            <Table rows={[
              ['Jeu', 'Effet'],
              ['Quiz Omar', 'Élimine 1 mauvaise réponse + TTS lit la question'],
              ['Mots Esma', 'Barre 1 option incorrecte + TTS prononce le mot'],
              ['Lettres Mohamed', 'TTS indique la rangée clavier (milieu/haut/bas)'],
              ['Mots Mohamed', 'TTS épelle le mot lettre par lettre'],
              ['Sciences Mohamed', 'Élimine 1 mauvaise réponse + TTS reprend la question'],
            ]} />
          </Q>
        </Section>

        <Section title="5. Répétition espacée (courbe de l'oubli)">
          <Q q="Comment fonctionne la courbe de l'oubli ?">
            Play & Perform utilise l'algorithme <strong>SM-2</strong> (comme Anki).
            Chaque question a un état : <em>nouveau → en apprentissage → à réviser → maîtrisé</em>.
            <Table rows={[
              ['Situation', 'Prochain affichage'],
              ['1ère bonne réponse', 'J+3 (dans 3 jours)'],
              ['2ème bonne réponse', 'J+7 (dans 7 jours)'],
              ['3ème+ bonne réponse', 'Intervalle × facteur de facilité (croissant)'],
              ['Réponse fausse', 'Immédiatement à la prochaine session'],
              ['Maîtrisé (≥ 21 jours)', 'Affiché en dernier, seulement si besoin de remplissage'],
            ]} />
          </Q>
          <Q q="Dans quel ordre les questions sont-elles choisies ?">
            <strong>Priorité : questions dues &gt; nouvelles &gt; maîtrisées.</strong> Les questions dont la date de révision est passée passent en premier.
          </Q>
          <Q q="Que signifient les badges sur la grille des matières ?">
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Chiffre orange</strong> = nombre de questions dues à revoir aujourd'hui → à faire en priorité</li>
              <li><strong>✓ vert</strong> = toutes les questions de cette matière sont maîtrisées</li>
              <li><strong>Pas de badge</strong> = tout est nouveau (jamais touché)</li>
            </ul>
          </Q>
        </Section>

        <Section title="6. Les matières (Omar — 14 au total)">
          <Q q="Quelles matières sont disponibles ?">
            <Table rows={[
              ['Matière', 'Emoji', 'Questions'],
              ['Mathématiques', '🧮', '8'],
              ['Français', '📝', '5'],
              ['SVT', '🔬', '4'],
              ['Histoire-Géo', '🏛️', '4'],
              ['Physique-Chimie', '⚡', '4'],
              ['Espace', '🚀', '10'],
              ['Météo', '🌦️', '8'],
              ['Chimie', '⚗️', '8'],
              ['Mécanique', '⚙️', '8'],
              ['Géographie', '🌍', '9'],
              ['Anglais', '🇬🇧', '9'],
              ['Espagnol', '🇪🇸', '8'],
              ['Informatique', '💻', '8'],
              ['Télécom', '📡', '8'],
            ]} />
            Chaque question a un emoji visuel affiché dans la carte.
          </Q>
          <Q q="Combien de questions par session ?">
            <strong>5 questions</strong> sélectionnées par le SRS (priorité aux dues, puis nouvelles).
          </Q>
        </Section>

        <Section title="7. Jeu Mohamed — Clavier">
          <Q q="Quels modes de jeu sont disponibles ?">
            <Table rows={[
              ['Mode', 'Description', 'XP'],
              ['🔤 Lettres', 'Tapez la lettre affichée (clavier physique ou bouton écran)', '5 XP'],
              ['📝 Mots', 'Tapez un mot complet lettre par lettre', '10 XP'],
              ['🔬 Sciences', 'QCM de découverte scientifique (3 options)', '15 XP'],
            ]} />
          </Q>
          <Q q="Quels sont les 4 niveaux de difficulté en mode Lettres ?">
            <Table rows={[
              ['Niveau', 'Lettres'],
              ['N1', 'a, s, d, f, j, k, l (rangée du milieu)'],
              ['N2', 'q, w, e, r, t, y, u, i, o, p (rangée du haut)'],
              ['N3', 'z, x, c, v, b, n, m (rangée du bas)'],
              ['N4', 'Les 26 lettres mélangées'],
            ]} />
          </Q>
        </Section>

        <Section title="8. Jeu Esma — Mots">
          <Q q="Comment se joue le jeu Esma ?">
            Un emoji géant s'affiche → Esma tape sur le bon mot parmi 3 choix. <strong>6 questions par session</strong>.
            Langues disponibles : Français 🇫🇷, English 🇬🇧, Español 🇪🇸.
          </Q>
        </Section>

        <Section title="9. Astuces XXXL">
          <Q q="Comment progresser le plus vite en XP ?">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Enchaîner les sessions <strong>Sciences Mohamed</strong> (15 XP × 5 questions = 75 XP)</li>
              <li>Réussir des <strong>quiz parfaits</strong> Omar (+20 XP bonus)</li>
              <li>Varier les matières → chaque nouvelle matière a 8-10 questions "new" à fort XP</li>
            </ol>
          </Q>
          <Q q="Comment débloquer le Robot 🤖 (avatar max — 500 XP) rapidement ?">
            5 sessions Sciences Mohamed (75 × 5 = 375 XP) + 3 quiz parfaits (≈ 75 XP chacun) = <strong>600 XP</strong>.
          </Q>
          <Q q="Comment réinitialiser la progression SRS d'une matière ?">
            Console du navigateur : <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">localStorage.removeItem('srs:omar:maths')</code>
          </Q>
          <Q q="La plateforme fonctionne-t-elle hors connexion ?">
            Oui. Toute la logique est côté client. Sans internet, la sync Supabase est suspendue mais le jeu fonctionne entièrement.
          </Q>
        </Section>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
          <p className="text-slate-400 text-xs">Play & Perform v1.0 · Dernière mise à jour : 2026-05-30</p>
          <Link href="/" className="mt-3 inline-flex rounded-xl bg-sky-500 text-white font-bold px-5 py-2.5 text-sm hover:bg-sky-400 transition-colors">
            Commencer à jouer →
          </Link>
        </div>
      </div>
    </div>
  );
}
