# TODO — Play Perform

## ✅ Livré (v0.5.3)

- Auth parent : inscription / connexion / reset mot de passe / activation email
- CRUD élèves : add / edit / delete via API server-side (bypass RLS)
- Mode selector sessionnel : chaque session peut choisir l'activité
- Mode assisté configurable par élève (pas figé sur un profil nommé)
- Quiz SRS SM-2 + sablier 30s + XP décroissants selon vitesse de réponse
- Récap quiz : mauvaises réponses en premier + bonne réponse affichée
- Import questions CSV + admin édition/suppression
- Release notes Supabase + page /releases searchable
- Bouton "Continuer quand même" quand SRS bloque
- **100+ questions brevet** : Math (15), Français (15), HG (15), SVT (15), Phys-Chim (15), Anglais (15), Espagnol (10)

## Priorité 1 — Contenu

- [x] **100+ questions quiz brevet** ✅ v0.5.3
- [ ] Plus de mots pour Esma (actuellement 8 par langue) → 30+ par langue
- [ ] Phrases simples pour Esma (pas seulement mots isolés)
- [ ] Niveaux 3-4 Mohamed mots à taper

## Priorité 2 — Admin / Qualité

- [ ] Migration Supabase 007b appliquée (colonnes mode/learning_mode sur students)
- [ ] Configurer env vars prod (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL, ADMIN_EMAILS)
- [ ] Checklist item 6 : admin liste élèves avec suivi progression
- [ ] Streak quotidien visible sur la page d'accueil
- [ ] Tests e2e Playwright à jour

## Priorité 3 — Features futures

- [ ] Compétition live (strike entre joueurs, récompenses supervisées)
- [ ] Mode compétition classement
- [ ] Dashboard parent avec suivi progression de chaque élève
- [ ] Export portfolio compétences Omar
