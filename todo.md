# TODO — Play Perform

Fichier unique de pilotage : **en cours**, **backlog** et **bugs connus** (remplace `in-progress.md` et `knownBugs.md`). Supprimer les lignes une fois réalisées ; l'état du projet est dans `README.md`.

## En cours — Landing visiteur + monolithe modulaire (POC)
 Nouveau code en anglais, textes UI en français. Approche « strangler » : `src/modules/` à côté de l'existant, anciens `lib/*` = ré-exports. Modes primaires (lecture, clavier, mots) hors modules. POC : données mockées / seed local.

**Règle produit : l'XP est au compte ; le niveau d'avancement (1 → 5) est par compétence et par élève** (`skills/application/skill-progress.ts`, clé `pp:skill-levels:<profileId>`). Le niveau déduit de l'XP s'appelle « Rang ».

- [ ] Étape 2 — Architecture modulaire : shared, `eslint-plugin-boundaries`, spaced-repetition, rewards, quizzes, contrats
- [ ] Étape 3 — Modèle de données skills + seed (catalogue en base) ; vérifier côté serveur la réussite d'un quiz avant de relever le niveau (aujourd'hui le client demande le relèvement)
- [ ] Étape 4 — Landing : constellation, célébrations + XP via `rewards`, badge « Premier pas »
- [ ] Rôle examinateur dédié (aujourd'hui = admin `ADMIN_EMAILS`) ; contenu quiz/flashcards pour « Logique » et « Méthode » (évaluation seule pour l'instant)
- [ ] Notifier l'élève / le parent quand une évaluation est corrigée

## Franchise / multi-organisations (voir docs/saas-franchise.md)
- [ ] **Avant le 1er centre externe** : appliquer `supabase/migrations/20261015000000_anon_parent_only.sql` (accès anonymes limités à la société mère ; la synchro XP / badges passe déjà par `PUT /api/progress`) — migration refusée à l'application depuis l'assistant, à lancer toi-même ou à autoriser
- [ ] Libre-service : page publique d'un centre + code du centre → l'apprenant crée son profil et demande ses cours
- [ ] Nommer un responsable pour la société mère elle-même (aujourd'hui : super admin via `ADMIN_EMAILS`) ; ajouter `platform_admins` côté UI
- [ ] Marque par centre (logo, couleurs, sous-domaine) ; facturation par centre. *Décision : catalogue, questions et tarifs restent communs à tous les centres.*
- [ ] RLS sur `parcours` / `parcours_enrollments` / `questions` / `release_notes`

## Release, abonnements, déploiement
- [ ] **Définir `LEARNER_TOKEN_SECRET`** (Vercel) : signe les sessions apprenant ; à défaut, la clé service role sert de secret
- [ ] **Web Push en prod** : variables VAPID + `CRON_SECRET` sur Vercel, planificateur toutes les 5 min vers `/api/push/dispatch` (procédure : `docs/deploiement.md`)
- [ ] Centre de formation = admin (`ADMIN_EMAILS`) : prévoir un rôle « centre » distinct et des notifications de décision (inscription, correction)
- [ ] Vérifier côté serveur le temps réellement travaillé (aujourd'hui l'effort quotidien est déclaratif)
- [ ] **Emails d'inscription prod** : saisir Brevo (`smtp-relay.brevo.com:587`) dans Supabase → Auth → SMTP Settings, valider l'expéditeur dans Brevo, relever la limite d'emails, vérifier `NEXT_PUBLIC_SITE_URL` (procédure : `docs/deploiement.md`)
- [ ] Prod : activer RLS sur `questions` et `release_notes` (alerte sécurité Supabase) avec les policies adaptées
- [ ] Vérification visuelle tarifs / admin (Docker arrêté)
- [ ] Paiement en ligne (non demandé pour l'instant)

## Backlog — Contenu
- [ ] Lecture syllabique v0.7.x : Assembler, Compter, niveaux 3-4, estompage, SRS, import CSV mots, audio enregistré
- [ ] Plus de mots pour le niveau initié (8 par langue → 30+)
- [ ] Phrases simples pour le mode assisté (pas seulement mots isolés)
- [ ] Niveaux 3-4 : mots à taper pour le niveau initié

## Backlog — Admin / Qualité
- [ ] Admin : liste des élèves avec suivi de progression
- [ ] Revue façon Anki après chaque quiz avec erreur ; SRS : intervalle × facteur de facilité (réussite parfaite ×2-3, lacunes → 1 jour)
- [ ] Badge « Rapide ! » (`fast-learner`) défini mais jamais débloqué
- [ ] Tests e2e Playwright à jour

## Backlog — Futur
- [ ] Avec un quiz sans compte sur une compétence indiquer un lien pour passer en revue les reponses de l'apprenant pour le feedback
- [ ] Compétition live (strike entre joueurs, récompenses supervisées) et classement
- [ ] Dashboard parent avec suivi de chaque élève
- [ ] Export portfolio de compétences d'un élève
- c'est un SAAS de centre de formation pour vendre le modele en tant que franchise
- [ ] mise en place de backoffice pour le centre de formation

## Bugs connus (supprimer une fois corrigé)
_Aucun bug ouvert._ (profiles/scores, `/api/releases` et hydration `/mots` `/keyboard` corrigés, à livrer en 0.7.1 ; migrations prod appliquées le 2026-10-07.)
- l'acces parent a remplacer par acces enseignant pour ajouter ses eleves et leur donner un acces
- un accès apprenant permet a un eleve d'acceder a ses comptences et apprentissage
avant de s'inscrire a un cours l'eleve doit consulter la fiche du cours et presenter une demande au centre de formation qui propose le cours/compétence
