# TODO — SYNTH.EDU Play Perform

## ✅ Livré (v0.5.1)

- Auth parent : inscription / connexion / reset mot de passe / activation email
- CRUD élèves : add / edit / delete via API server-side (bypass RLS)
- Mode selector sessionnel : chaque session peut choisir l'activité
- Mode assisté configurable par élève (pas figé sur un profil nommé)
- Quiz SRS SM-2 + sablier 30s + XP décroissants selon vitesse de réponse
- Récap quiz : mauvaises réponses en premier + bonne réponse affichée
- Import questions CSV + admin édition/suppression
- Release notes Supabase + page /releases searchable
- Bouton "Continuer quand même" quand SRS bloque

## Priorité 1 — Contenu

- [ ] Plus de questions quiz (20+ par matière, actuellement 5-10)
- [ ] Questions Gourou (difficulté 4) pour Omar
- [ ] Plus de mots pour Esma (actuellement 8 par langue)
- [ ] Phrases simples pour Esma (pas seulement mots isolés)
- [ ] Niveaux 3-4 Mohamed mots à taper

## Priorité 2 — Admin / Qualité

- [ ] Checklist item 6 : admin liste élèves avec suivi progression
- [ ] Migration Supabase 007b appliquée (colonnes mode/learning_mode sur students)
- [ ] Streak quotidien visible sur la page d'accueil
- [ ] Tests e2e Playwright à jour

## Priorité 3 — Features futures

- [ ] Compétition live (strike entre joueurs, récompenses supervisées)
- [ ] Mode compétition classement
- [ ] Dashboard parent avec suivi progression de chaque élève
- [ ] Export portfolio compétences Omar
