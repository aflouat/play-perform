# TODO — SYNTH.EDU

## Fait ✅
- [x] Scaffold Next.js 16 + Tailwind + TypeScript strict
- [x] Hook `useEngagement` (tracking passif, heartbeat 30s, AFK 60s)
- [x] Sélection de profil à l'accueil (Omar, Esma, Mohamed)
- [x] Light mode design Lumini-inspired
- [x] Score XP + badges + localStorage persist
- [x] Avatar picker par profil
- [x] Quiz interactif pour Omar (5 matières, XP, feedback audio)
- [x] Jeu mots Esma (FR/EN/ES, TTS enthousiaste)
- [x] Jeu clavier Mohamed — Mode Lettres (clavier physique + tap)
- [x] Jeu clavier Mohamed — Mode Mots (taper des mots complets)
- [x] Jeu clavier Mohamed — Mode Sciences (QCM découverte)
- [x] Score animé visible (+XP flottant, score-pop)
- [x] Sons enthousiastes (Web Audio + SpeechSynthesis vocal enthousiaste)
- [x] 50 tests unitaires + intégration — 100% pass

## Priorité 1 — Backend
- [ ] Supabase auth + DB (progression, scores)
- [ ] API secure-ping (anti-triche heartbeat)
- [ ] Sauvegarde progression dans le cloud

## Priorité 2 — Contenu
- [ ] Plus de questions quiz (actuellement 4 par matière → viser 20+)
- [ ] Plus de mots pour Esma (actuellement 8 par langue)
- [ ] Plus de lettres/mots pour Mohamed niveaux 3+4
- [ ] Contenu Esma : phrases simples à lire (pas seulement mots)

## Priorité 3 — Expérience
- [ ] Dashboard parent (suivi progression Omar)
- [ ] Streak quotidien (déjà en place dans useScore, activer l'affichage)
- [ ] Mode compétition (classement entre profils)
- [ ] Générateur adaptatif (cibler les lacunes Omar)

## Priorité 4 — Infrastructure
- [ ] Routes 3 mondes (Lab, Clubs, Hub) pour Omar
- [ ] Export portfolio compétences Omar
- [ ] Authentification (email/Google)
