# SYNTH.EDU — Business Plan

## 1. Executive Summary

SYNTH.EDU est une plateforme d'apprentissage passif pour les familles tech : un parent développeur partage sa veille technologique, son ado ou collégien progresse dessus automatiquement, sans friction ni saisie manuelle.

**Différenciation core** : un moteur de tracking passif (Page Visibility API + détection AFK + validation serveur) qui mesure le temps de focus réel sur un contenu — sans qu'aucun bouton ne soit cliqué.

**Fondateur** : expert Java, enseignant OpenClassrooms/Skool, certifié PMP, parent d'ado, bénévole d'accompagnement collégien. Le produit résout un problème que le fondateur vit chaque jour.

---

## 2. Le Problème

### Pour le dev-parent/mentor
- Il consomme beaucoup de contenus tech (YouTube, articles, podcasts) mais rien n'est organisé, rien n'est partageable facilement vers les jeunes qu'il accompagne
- Les outils de veille existants (Notion, Readwise, Feedly) sont solos — pas conçus pour partager avec un apprenant
- Il n'a pas le temps de créer des cours : il veut partager sa veille telle quelle

### Pour l'ado/collégien
- Les plateformes éducatives (Duolingo, Khan Academy, Coursera) sont soit trop scolaires, soit sans lien avec le monde pro réel
- Il apprend mieux dans un cadre informel, avec du contenu choisi par quelqu'un qu'il connaît
- Il ne veut pas "faire ses devoirs" — mais il veut progresser

### Le gap de marché
Aucune plateforme ne connecte la **veille professionnelle d'un adulte tech** à l'**apprentissage informel d'un jeune** dans un cadre familial/mentorat.

---

## 3. La Solution

### Proposition de valeur
> "Partage ta veille. Ton ado apprend. Automatiquement."

### Les 3 composantes

**Hub Veille (MVP Phase 1)**
- Le parent importe ses ressources (YouTube, articles, liens) dans son Hub
- Il crée un "cercle" (famille + quelques apprenants)
- Les membres du cercle voient la veille curatée
- Le tracking passif mesure le temps de focus réel sur chaque ressource

**Lab World (Phase 2)**
- Parcours structurés basés sur la veille du parent
- Suivi de progression pour l'ado par module/compétence

**Club World (Phase 3)**
- Plusieurs familles/mentors créent des clubs thématiques
- Gouvernance légère : un "board élu" (animateur principal + contributeurs)

---

## 4. Personas

### Persona A : Le Dev-Parent / Dev-Mentor
- **Profil** : 30-45 ans, développeur ou architecte senior, certifié ou en formation continue
- **Habitudes** : consomme 3-5h de contenus tech/semaine (YouTube, newsletters, podcasts)
- **Frustration** : "Je vois plein de trucs intéressants pour mon ado mais je n'ai pas le temps de les lui présenter proprement"
- **Motivation** : transmettre son expertise sans créer de cours formels
- **Canal d'accès** : OpenClassrooms, Skool, LinkedIn tech, communautés dev

### Persona B : L'Ado/Collégien Apprenant
- **Profil** : 12-20 ans, gaming-native, découvre le code via YouTube/TikTok
- **Habitudes** : 2-4h/jour d'écrans, consommation passive forte
- **Frustration** : "Les cours c'est chiant mais les vidéos YouTube de code c'est cool"
- **Motivation** : progresser sans que ça ressemble à du travail scolaire
- **Canal d'accès** : via le parent/mentor

---

## 5. Roadmap Produit

### Phase 0 — Validation sans code (S1 à S8)
**Objectif** : 20 personnes veulent ça avant d'écrire une ligne de code.

| Action | Outil | Temps | Signal attendu |
|--------|-------|-------|----------------|
| Newsletter veille tech | Beehiiv (gratuit) | 30 min setup | 50 abonnés en 8 semaines |
| Channel Skool "Dev+Ado" | Skool existant | 15 min | 10 familles actives |
| Usage tracking perso | Notion/Readwise | En cours | Identifier les vraies frictions |

**Go/No-go** : 50 abonnés + 10 familles → lancer Phase 1.

### Phase 1 — Hub Veille MVP (S9 à S20, 1h/jour)
**Objectif** : Un seul monde, un seul problème résolu.

- Hub personnel : importer YouTube + articles + liens
- Tracking passif (le moteur différenciant)
- Partage vers "cercle" (famille + 5 max)
- Dashboard simple : temps de focus par ressource

**Stack** : Next.js 14 + TypeScript strict + Supabase + Tailwind + shadcn/ui

**Ne PAS construire** : Lab World, Club World, système XP, niveaux, governance.

### Phase 2 — Lab World (mois 5+)
Déclenché uniquement si : demande explicite de 3+ familles actives.

### Phase 3 — Club World (mois 9+)
Déclenché uniquement si : groupes de familles se forment naturellement autour d'un thème.

---

## 6. Modèle Économique

### Revenus projetés

| Horizon | ARR cible | Modèle |
|---------|-----------|--------|
| M6 | €0 | Usage personnel + beta fermée |
| M12 | €2 400-6 000 | 30-50 familles × €9/mois × 12 mois |
| M24 | €6 000-18 000 | 100+ familles + tier Communauté |

### Plans

| Plan | Prix | Inclus |
|------|------|--------|
| Gratuit | €0 | 1 Hub veille, partage 3 personnes max |
| Famille | €9/mois | Hub illimité + cercle famille + dashboard ado |
| Communauté | €15/mois | Tout Famille + Club + accès veilles des autres |

### Distribution (coût d'acquisition = €0 Phase 1)
- Audience OpenClassrooms existante → newsletter → conversion
- Audience Skool existante → channel dédié → onboarding
- Bouche-à-oreille : 1 famille convaincue → invite ses pairs

---

## 7. Go-To-Market

### Séquence de lancement

```
Semaine 1-2 : Newsletter #1 sur Beehiiv (veille perso) → partager sur OC + Skool
Semaine 3-4 : Channel Skool "Dev Parent + Ado" → 1er défi hebdomadaire
Semaine 5-8 : Recueillir feedback, identifier les 10 familles pilotes
Semaine 9   : Commencer le code avec les retours réels
Mois 5      : Beta fermée 10 familles → itérations rapides
Mois 6      : Ouverture progressive (liste d'attente)
```

### Canaux prioritaires
1. OpenClassrooms (audience existante, gratuit)
2. Skool (communauté existante, gratuit)
3. LinkedIn (contenu de veille partagée → attirer des dev-parents)
4. Bouche-à-oreille famille (le plus puissant, le moins scalable)

---

## 8. Analyse Concurrentielle

| Concurrent | Forces | Leur gap | Notre avantage |
|-----------|--------|---------|----------------|
| Duolingo | 500M users, gamification | Pas pour devs, pas de veille perso | Contenu réel du mentor |
| Khan Academy | Contenu structuré, gratuit | Top-down, pas de veille parent | Curation bottom-up |
| Readwise | Rétention mémorielle excellente | Solo, pas d'apprentissage ado | Dimension famille + partage |
| Notion/Obsidian | Flexibilité totale | Pas de tracking passif, pas social | Mesure focus automatique |
| Skool | Communauté forte | Pas de tracking engagement contenu | KPIs objectifs du temps appris |
| YouTube | Contenu illimité | Aucun suivi, aucune structure | Curation + mesure + cercle |

**Différenciation défendable** : le tracking passif n'est pas une feature facilement copiable — c'est une mécanique technique (Page Visibility + heartbeat + anti-triche) qui demande une vraie implémentation.

---

## 9. Ressources Nécessaires

### Humaines
- 1 fondateur, 1h/jour (constraint principale)
- Agents IA (Claude Code, Cursor) pour la génération de code → le fondateur = chef de produit

### Techniques (Phase 1)
- Next.js 14, TypeScript strict, Supabase (gratuit ≤500MB), Tailwind, shadcn/ui
- YouTube Data API (gratuit ≤10K req/jour)
- Vercel (gratuit pour hobby)

### Financières
- Coût Phase 0-1 : ~€0/mois (tous outils gratuits)
- Supabase Pro (si >500MB) : €25/mois → déclenché par traction réelle

---

## 10. Métriques de Succès (KPIs Go/No-Go)

### Phase 0 (S1-S8)
- [ ] 50 abonnés newsletter
- [ ] 10 familles actives sur Skool
- [ ] Le fondateur utilise son propre outil chaque semaine

### Phase 1 (S9-S20)
- [ ] 10 familles en beta fermée utilisent le Hub hebdomadairement
- [ ] Temps moyen de focus/semaine > 30 min/utilisateur
- [ ] 3 familles paient €9/mois spontanément

### Règle d'or anti-île-déserte
> Si le fondateur n'utilise pas SYNTH.EDU pour sa propre veille depuis 2 semaines → pause et retrospective avant de continuer.
