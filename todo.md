# TODO — Play Perform

Fichier unique de pilotage : **en cours**, **backlog** et **bugs connus** (remplace `in-progress.md` et `knownBugs.md`). Supprimer les lignes une fois réalisées ; l'état du projet est dans `README.md`.

## En cours — v0.13 : oraux sur créneaux + landing de chaque centre franchisé
Décisions (2026-10-10) : back-office centralisé (société mère) ; le centre recrute les élèves et fait le support commercial ; **seul le créneau d'oral est payant**, **encaissé en central** puis la part du centre lui est **reversée** (commission de la plateforme retenue). Modèle repris d'app-store / freelancehub (créneaux, réservation atomique, montants recalculés serveur).
- [x] Créneaux, réservation, résultat de l'oral, landing des centres et demandes de rappel (livrés, voir README modules `exams` et `storefront`)
- [x] « Peut faire passer les oraux » (réglage du centre), notification aux examinateurs, liste d'attente de l'oral final avec alerte au centre et à l'élève
- [ ] **Prod : appliquer `20261023000000_exam_slots.sql`, `20261024000000_centre_leads.sql` puis `20261025000000_oral_staffing.sql`** (SQL Editor, dans cet ordre ; testées sur Postgres 17, rejouables)
- [ ] Notifications hors application (Web Push / e-mail) : examinateur autorisé, élève en attente quand des créneaux s'ouvrent, centre quand un élève attend depuis plus de 3 jours ; lien « Agenda des oraux » dans le menu pour un enseignant autorisé
- [ ] Rappel de l'oral la veille (Web Push / e-mail) ; « Ton oral : mardi 10:00 » dans « Aujourd'hui » ; notifier l'examinateur d'une réservation ou annulation
- [ ] Lien visio de l'oral (ou salle du centre) sur la réservation ; vérifier l'identité de l'élève avant l'oral
- [ ] Landing : logo / photo et horaires du centre (édités par le centre), sitemap des pages `/centres/*`, lien vers la page depuis l'accueil (« Trouver un centre près de chez moi »)
- [ ] **Paiement du créneau (étape suivante)** : prix fixé par la société mère, encaissement central (Stripe, via l'intégration Vercel Marketplace à relier au compte), commission de la plateforme et part du centre enregistrées par réservation, relevé des reversements par centre ; réservation confirmée au paiement (webhook idempotent)

## En cours — Landing visiteur + monolithe modulaire (POC)
 Nouveau code en anglais, textes UI en français. Approche « strangler » : `src/modules/` à côté de l'existant, anciens `lib/*` = ré-exports. Modes primaires (lecture, clavier, mots) hors modules. POC : données mockées / seed local.

**Règle produit : l'XP est au compte ; le niveau d'avancement (1 → 5) est par compétence et par élève** (`skills/application/skill-progress.ts`, clé `pp:skill-levels:<profileId>`). Le niveau déduit de l'XP s'appelle « Rang ».

- [ ] Étape 2 — Architecture modulaire : shared, `eslint-plugin-boundaries`, spaced-repetition, rewards, quizzes, contrats
- [ ] Étape 3 — Modèle de données skills + seed (catalogue en base) ; vérifier côté serveur la réussite d'un quiz avant de relever le niveau (aujourd'hui le client demande le relèvement)
- [ ] Étape 4 — Landing : constellation, célébrations + XP via `rewards`, badge « Premier pas »
- [ ] Rôle examinateur dédié (aujourd'hui = admin `ADMIN_EMAILS`) ; contenu quiz/flashcards pour « Logique » et « Méthode » (évaluation seule pour l'instant)
- [ ] Notifier l'élève (Web Push) quand une évaluation est corrigée ou qu'un centre retire un accès

## Parcours de l'apprenant avec code (optimisations proposées)
- [ ] Première connexion : proposer ensuite les rappels (heure + effort) et la lecture de la fiche de formation ; tester sur mobile
- [ ] **« Mon chemin vers le diplôme »** : liste à cocher (inscrit, niveau 5, évaluation validée, nom renseigné) dans le panneau de la compétence, à partir de `GET /api/diploma`
- [ ] Communauté : forum / entraide (questions entre élèves, modéré par le centre) — le fil des réussites, les Bravo, les binômes et le mur des pièges sont faits
- [ ] Questions de niveau 4-5 dans les banques (le diplôme s'appuie sur l'évaluation validée par un examinateur, pas sur les quiz)
- [ ] Le centre peut corriger prénom / nom d'un élève avant impression (déjà possible dans sa fiche) ; ajouter une date de naissance si le diplôme l'exige
- [ ] Diplôme : signature numérique / page publique de vérification de la référence `PP-…`

- [ ] Binômes : message d'encouragement au partenaire (texte préécrit) ; choix d'un binôme par le centre ; bonus plus riche (badge d'équipe)
- [ ] Pièges classiques : alimenter aussi `/quiz/[subject]` (matières) en statistiques ; notifier le centre des questions réussies par presque personne (question à revoir)

- [ ] **Prod : appliquer `supabase/migrations/20261022000000_training_paths.sql`** (table `training_paths` + les 3 parcours actuels ; copier-coller dans le SQL Editor) — sans elle, `/admin/formations` ne peut pas enregistrer ; la carte des élèves utilise en attendant les parcours intégrés
- [ ] Catalogue métier : compétences pharma / environnement (ex. BPF, prélèvements d'eau) avec leurs banques, pour que les futurs parcours n'empruntent pas les compétences du laboratoire ; relire les questions « laboratoire » avec un formateur du métier ; questions de niveau 5 (aujourd'hui les quiz s'arrêtent à la difficulté 4)
- [ ] Centre de commande : dates de complétion des phases en base (aujourd'hui sur l'appareil) ; événement « a validé la Phase n » dans le fil ; contenu quiz pour Logique / Méthode (la remise à niveau y mène à l'évaluation) ; lien avec la table historique `parcours` (sessions de quiz multi-matières, sans rapport aujourd'hui)

## UX par rôle (avant le backend centre mère / franchises)
- [ ] Vérifier le SIREN / SIRET auprès de l'API Sirene (INSEE) à l'inscription d'un centre (aujourd'hui : somme de contrôle + examen manuel par la société mère)
- [ ] Tableaux de bord : graphiques de progression dans le temps (activité par semaine), export CSV pour le centre, notification au centre quand une demande attend depuis plus de 3 jours
- [ ] Vérifier à l'écran les trois espaces (visiteur, apprenant, centre) sur mobile ; textes finaux avec les premiers utilisateurs
- [ ] Un enseignant sans centre (comptes existants) est rattaché à la société mère : proposer de rejoindre ou créer son centre

## Franchise / multi-organisations (voir README « Organisations »)
- [ ] **Avant le 1er centre externe** : appliquer `supabase/migrations/20261015000000_anon_parent_only.sql` (accès anonymes limités à la société mère ; la synchro XP / badges passe déjà par `PUT /api/progress`) — migration refusée à l'application depuis l'assistant, à lancer toi-même ou à autoriser
- [ ] Libre-service : page publique d'un centre + code du centre → l'apprenant crée son profil et demande ses cours
- [ ] Nommer un responsable pour la société mère elle-même (aujourd'hui : super admin via `ADMIN_EMAILS`) ; ajouter `platform_admins` côté UI
- [ ] Marque par centre (logo, couleurs, sous-domaine) ; facturation par centre. *Décision : catalogue, questions et tarifs restent communs à tous les centres.*
- [ ] RLS sur `parcours` / `parcours_enrollments` (lecture ouverte à tous), `questions` / `release_notes` (sans RLS)

## Release, abonnements, déploiement
- [ ] Compétition : relire les 12 pseudos générés (`generateNickname`) ; décider si l'élève peut proposer son pseudo à l'enseignant
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
- [ ] Compétition : duels en temps réel (Supabase Realtime) — étape 2 après le classement et les défis différés
- [ ] Dashboard parent avec suivi de chaque élève
- [ ] Export portfolio de compétences d'un élève
- c'est un SAAS de centre de formation pour vendre le modele en tant que franchise
- [ ] mise en place de backoffice pour le centre de formation

## Bugs connus (supprimer une fois corrigé)
_Aucun bug ouvert._ (profiles/scores, `/api/releases` et hydration `/mots` `/keyboard` corrigés, à livrer en 0.7.1 ; migrations prod appliquées le 2026-10-07.)
