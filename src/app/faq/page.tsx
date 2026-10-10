import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { AppVersion } from '@/shared/ui/AppVersion';
import { Section, Q, Table } from './FaqParts';

export const metadata: Metadata = {
  title: 'FAQ — Play & Perform',
  description: 'Toutes les règles et fonctionnalités de la plateforme Play & Perform',
};

export default function FaqPage() {
  return (
    <div className="flex-1">
      <div className="max-w-2xl mx-auto px-5 pt-10 pb-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 text-sm mb-8 hover:text-slate-600 transition-colors">← Retour</Link>
        <header className="mb-10">
          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight mb-2">FAQ — Play & Perform</h1>
          <p className="text-slate-500">Guide complet pour tirer le maximum de la plateforme.</p>
        </header>

        <Section title="1. Les profils">
          <Q q="Quels profils sont disponibles ?">
            <Table rows={[['Mode','Niveau','Activité','Route'],['📚 Quiz','Collège','Quiz 14 matières','/home → /quiz'],['🌸 Mots','Primaire','Mots FR / EN / ES','/mots'],['⌨️ Clavier','CP','Clavier, Mots, Sciences','/keyboard'],['📖 Lecture','CP','Lecture par syllabes','/lecture']]} />
          </Q>
          <Q q="Le profil est-il sauvegardé entre les sessions ?">Oui. Score et profil mémorisés en localStorage, synchronisés avec Supabase en arrière-plan.</Q>
          <Q q="Comment revenir à la sélection ?">Flèche ← en haut à gauche.</Q>
        </Section>

        <Section title="2. Score et XP">
          <Q q="Comment fonctionne l'XP ?">
            <Table rows={[['Action','XP'],['Bonne réponse (Initié)','10'],['Bonne réponse (Apprenti)','15'],['Bonne réponse (Expert)','20'],['Bonne réponse (Gourou)','30'],['Quiz parfait','+20 bonus'],['Réponse rapide','jusqu\'à 100% du XP de base']]} />
          </Q>
          <Q q="Comment progresser en rang ?"><strong>100 XP = 1 rang</strong>. L&apos;XP est attaché au compte de l&apos;élève. La barre dorée dans le header montre la progression vers le rang suivant. XP décroissants selon le temps (sablier 30s).</Q>
          <Q q="Quels badges peut-on débloquer ?">
            <Table rows={[['Badge','Condition'],['🎯 Premier Quiz','Premier gain d\'XP'],['⭐ Quiz parfait','Toutes correctes en une session'],['🔥 3 jours de suite','3 jours consécutifs d\'activité'],['⚡ Une semaine !','7 jours consécutifs'],['🔍 Chercheur·euse','500 XP cumulés']]} />
          </Q>
        </Section>

        <Section title="3. Avatars">
          <Q q="Quels avatars sont disponibles ?">
            <Table rows={[['Avatar','XP requis'],['🧑‍🚀 Astronaute','0'],['🧪 Scientifique','0'],['🥷 Ninja','0'],['🗺️ Explorateur·ice','100'],['🧙 Sorcier·ère','250'],['🤖 Robot','500']]} />
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

        <Section title="6. Les matières (14)">
          <Q q="Combien de questions par session ?"><strong>5 questions</strong> sélectionnées par SRS.</Q>
          <Q q="4 niveaux de difficulté">🌱 Initié → 📖 Apprenti → ⚡ Expert → 🔥 Gourou</Q>
        </Section>

        <Section title="7. Niveaux par compétence">
          <Q q="Le niveau dépend-il de l'XP ?">Non. L&apos;XP et le rang sont ceux du compte ; le <strong>niveau d&apos;avancement (1 → 5) est propre à chaque compétence</strong> et au projet d&apos;apprentissage de l&apos;élève.</Q>
          <Q q="Où voir ma progression ?">Sur <strong>Ma ville des compétences</strong> : chaque compétence est un bâtiment qui grandit avec ton niveau, jusqu&apos;au château (niveau 5). Touche-le pour voir ta barre vers la maîtrise, tes révisions passées et à venir, et fixer un <strong>objectif de date</strong>.</Q>
          <Q q="Comment monter d&apos;un niveau ?">Depuis <strong>Mes compétences</strong>, tu vois ton niveau puis tu choisis : un <strong>quiz</strong> (4 bonnes réponses sur 5 = niveau suivant), des <strong>flashcards</strong> pour réviser (libres, sans inscription), ou une <strong>évaluation</strong> rédigée, corrigée par un examinateur (formation complète).</Q>
          <Q q="Puis-je revoir mes réponses au test de niveau ?">Oui, même sans compte : le bouton « Revoir mes réponses » du résultat montre chaque question, ta réponse, la bonne réponse et les niveaux à retravailler.</Q>
          <Q q="Comment connaître son niveau de départ ?">Sur la page d&apos;accueil, le test de niveau (5 questions) donne un niveau de 1 à 5 pour la compétence choisie. Il est gratuit et fonctionne sans compte.</Q>
        </Section>

        <Section title="8. Accès enseignant et apprenant">
          <Q q="Qui crée les comptes ?">Le <strong>centre de formation</strong> (raison sociale, SIREN, établissement, adresse) s&apos;inscrit, ajoute ses élèves et génère pour chacun un <strong>code d&apos;accès</strong>.</Q>
          <Q q="Comment un centre s&apos;inscrit-il ?">Il dépose un dossier (raison sociale, SIREN, SIRET de l&apos;établissement, adresse). Play Perform l&apos;examine puis ouvre l&apos;espace du centre.</Q>
          <Q q="Qui fait quoi dans un centre de formation ?">Un <strong>centre de formation</strong> a ses élèves et ses <strong>enseignants</strong>. Les <strong>examinateurs</strong> corrigent les évaluations ; un examinateur peut être rattaché à plusieurs centres. Le <strong>responsable du centre</strong> recrute son équipe.</Q>
          <Q q="Comment un apprenant se connecte-t-il ?">Dans l&apos;<strong>Espace apprenant</strong>, il saisit son code à 8 caractères et retrouve ses compétences. Il n&apos;a accès qu&apos;à son propre profil.</Q>
          <Q q="Faut-il s&apos;inscrire pour jouer ?">Non : les <strong>quiz</strong> et les <strong>flashcards</strong> sont libres. Seule la <strong>formation complète</strong> (évaluations corrigées, plan de travail, diplôme) demande une inscription, <strong>validée automatiquement</strong> sur le moment après lecture de la <strong>fiche du cours</strong>. Le centre peut retirer un accès.</Q>
          <Q q="Pseudo, prénom, nom : qui voit quoi ?">Tu choisis un <strong>pseudo</strong> : c&apos;est le seul nom vu par les autres élèves (classement, communauté). Ton <strong>prénom et ton nom</strong> ne servent qu&apos;à imprimer ton <strong>diplôme</strong>.</Q>
          <Q q="Comment obtenir mon diplôme ?">Être inscrit à la formation complète, atteindre le niveau 5, faire valider par un examinateur une évaluation de niveau 4 ou plus, et renseigner ton prénom et ton nom. Tu l&apos;imprimes ensuite depuis ta ville.</Q>
        </Section>

        <Section title="9. Plan de travail et rappels">
          <Q q="Combien de temps par jour ?">Pour chaque compétence, choisis ton <strong>effort quotidien en minutes</strong> : la date de victoire (niveau 5) s&apos;affiche. Ou fixe une date et vois combien de minutes par jour il te faut.</Q>
          <Q q="Comment être rappelé ?">Choisis l&apos;<strong>heure du rappel</strong> et active les notifications : tu reçois chaque jour l&apos;heure, l&apos;effort et l&apos;objectif. L&apos;application doit être ouverte dans le navigateur.</Q>
        </Section>

        <Section title="10. Compétition et communauté">
          <Q q="Comment fonctionne la compétition ?">Chaque semaine, un <strong>défi</strong> de 5 questions est le même pour tout le monde, à relever une seule fois. Le classement du défi tient compte des bonnes réponses puis de la vitesse. Le classement du centre compare l&apos;XP, la série de jours et les niveaux.</Q>
          <Q q="Mon nom apparaît-il aux autres ?">Non : on n&apos;affiche qu&apos;un <strong>pseudo</strong>, choisi avec ton enseignant, et seulement aux élèves de ton centre. L&apos;enseignant peut aussi te retirer du classement.</Q>
          <Q q="C&apos;est quoi le binôme de la semaine ?">Chaque semaine, le centre te met en <strong>binôme</strong> au hasard avec un autre élève (le binôme change chaque semaine). Le contrat : si vous obtenez <strong>tous les deux la mention</strong> au défi (4 bonnes réponses sur 5), vous gagnez <strong>tous les deux +50 XP</strong>. Aidez-vous !</Q>
          <Q q="Que voient les autres de mes réussites ?">Le fil du centre annonce tes passages de niveau avec ton <strong>pseudo</strong> et les camarades peuvent t&apos;envoyer un <strong>Bravo</strong> 👏. Ton centre peut retirer un élément du fil.</Q>
          <Q q="Et si je me trompe ?">Une erreur est une leçon : tu vois ce que tu viens d&apos;apprendre, et combien d&apos;élèves sont tombés dans le même <strong>piège classique</strong> (statistiques anonymes).</Q>
          <Q q="Quelles récompenses ?">Les trois meilleurs du défi reçoivent une <strong>médaille</strong> 🥇🥈🥉 automatiquement (3 bonnes réponses minimum). L&apos;enseignant peut en retirer une.</Q>
        </Section>

        <Section title="11. Abonnements">
          <Q q="Quelles formules existent ?">Abonnement <strong>1 mois</strong>, <strong>1 an</strong> ou <strong>à vie</strong>, affichés sur la page d&apos;accueil. Le test de niveau reste gratuit.</Q>
        </Section>

        <Section title="12. Astuces">
          <Q q="Comment progresser le plus vite ?">
            <ol className="list-decimal pl-4 space-y-1">
              <li>Sessions Sciences du mode Clavier (15 XP × 5 = 75 XP)</li>
              <li>Quiz parfaits (+20 XP bonus)</li>
              <li>Répondre rapidement (sablier = XP maximum)</li>
            </ol>
          </Q>
          <Q q="Que devient mon adresse e-mail et mes données ?">Rien n&apos;est revendu et il n&apos;y a pas de publicité. Détails et droit à l&apos;effacement sur la page <Link href="/confidentialite" className="text-violet-600 underline">Confidentialité</Link>.</Q>
          <Q q="La plateforme fonctionne-t-elle hors connexion ?">Oui — toute la logique est côté client.</Q>
          <Q q="Comment réinitialiser le SRS ?">
            Console : <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{`localStorage.removeItem('srs:<id-élève>:maths')`}</code>
          </Q>
        </Section>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">
          <p className="text-slate-400 text-xs">Play & Perform · <AppVersion /></p>
          <Link href="/" className="mt-3 inline-flex rounded-xl bg-sky-500 text-white font-bold px-5 py-2.5 text-sm hover:bg-sky-400 transition-colors">
            Commencer à jouer →
          </Link>
        </div>
      </div>
    </div>
  );
}
