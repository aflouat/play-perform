# Spec MVP Phase 1 — Hub Veille

## Périmètre strict

**Ce qu'on build** : Hub Veille uniquement.  
**Ce qu'on ne build pas** : Lab World, Club World, système XP/niveaux, governance clubs.

---

## User Stories Phase 1

### US1 — Import de ressources
> En tant que dev-parent, je peux ajouter une ressource (URL YouTube, article, lien) à mon Hub Veille.

Acceptance criteria :
- Formulaire simple : URL + titre (auto-rempli si YouTube) + tags optionnels
- Support : YouTube, URLs génériques (articles, podcasts)
- La ressource apparaît dans mon Hub immédiatement

### US2 — Création d'un cercle
> En tant que dev-parent, je peux inviter des membres dans mon cercle (famille ou apprenants).

Acceptance criteria :
- Invitation par email ou lien
- Max 5 membres en plan gratuit, illimité en plan Famille
- Le membre voit la veille curatée du parent dès acceptation

### US3 — Tracking passif
> En tant qu'apprenant, mon temps de focus sur une ressource est mesuré automatiquement sans que je fasse quoi que ce soit.

Acceptance criteria :
- Tracking démarre au montage du composant contenu
- Pause si `document.hidden === true` (changement d'onglet)
- Pause si aucun événement (`mousemove`, `scroll`, `keydown`) pendant 60 secondes
- Heartbeat envoyé toutes les 30 secondes
- Serveur rejette les pings qui dépassent `maxDuration` du contenu

### US4 — Dashboard parent
> En tant que dev-parent, je vois combien de temps mes apprenants ont passé sur chaque ressource.

Acceptance criteria :
- Tableau : ressource × membre × temps de focus total
- Indicateur "consommé" / "pas encore vu" / "en cours"
- Données de la semaine en cours + historique 4 semaines

### US5 — Vue apprenant
> En tant qu'apprenant, je vois les ressources que mon mentor a partagées pour moi.

Acceptance criteria :
- Feed chronologique des ressources du cercle
- Indicateur visuel simple de ma progression (pas de gamification complexe Phase 1)
- Accès mobile-friendly

---

## Architecture technique Phase 1

```
src/
├── app/
│   ├── (zone3)-hub/
│   │   ├── page.tsx              ← feed de ressources du cercle
│   │   └── [contentId]/
│   │       └── page.tsx          ← vue contenu + tracking actif
│   ├── dashboard/
│   │   └── page.tsx              ← dashboard parent (temps de focus)
│   └── api/
│       └── ping/
│           └── route.ts          ← endpoint heartbeat (POST)
│
├── hooks/
│   └── useEngagement.ts          ← hook tracking passif (TDD first)
│
├── lib/
│   ├── db.ts                     ← Supabase client
│   └── secure-ping.ts            ← validation anti-triche serveur
│
└── types/
    └── index.ts                  ← Content, User, Circle, EngagementSession
```

---

## Schéma Supabase Phase 1

```sql
-- Utilisateurs (géré par Supabase Auth)
-- users : id, email, role ('mentor' | 'learner')

-- Ressources
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users,
  url text NOT NULL,
  title text NOT NULL,
  type text NOT NULL,         -- 'youtube' | 'article' | 'link'
  max_duration_seconds int,   -- cap anti-triche
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Cercles (groupes de partage)
CREATE TABLE circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users,
  name text NOT NULL
);

-- Membres d'un cercle
CREATE TABLE circle_members (
  circle_id uuid REFERENCES circles,
  user_id uuid REFERENCES auth.users,
  PRIMARY KEY (circle_id, user_id)
);

-- Sessions d'engagement (tracking passif)
CREATE TABLE engagement_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  resource_id uuid REFERENCES resources,
  total_seconds int DEFAULT 0,
  last_ping_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

---

## Ordre d'implémentation (TDD)

1. **Types** (`src/types/index.ts`) — définir `Content`, `User`, `Circle`, `EngagementSession`
2. **Tests useEngagement** — écrire les tests AVANT le hook :
   - Cas nominal : tracking actif → ping toutes les 30s
   - Cas inactivité : aucun événement 60s → pause
   - Cas changement d'onglet : `document.hidden` → pause immédiate
   - Cas reprise : retour sur l'onglet → reprend
3. **Hook useEngagement** — faire passer les tests
4. **secure-ping.ts** — logique validation `maxDuration` côté serveur
5. **API route `/api/ping`** — endpoint heartbeat
6. **UI Hub** — feed + vue contenu (intègre le hook)
7. **Dashboard** — tableau temps de focus

---

## Contraintes de code (rappel)

- Fichiers max 150 lignes — extraire des sous-composants si dépassement
- TypeScript strict — aucun `any`
- shadcn/ui pour tous les composants UI (pas réinventer)
- Commentaires uniquement si le WHY est non-obvious
