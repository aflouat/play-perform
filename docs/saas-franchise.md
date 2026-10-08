# Play Perform en franchise (multi-organisations)

Une seule application et une seule base ; chaque **centre de formation** (personne morale) est une organisation. La **société mère** « Play Perform » (id fixe `00000000-0000-4000-8000-000000000001`) possède tout ce qui existait avant, ainsi que les accès anonymes.

## Rôles
| Rôle | Portée | Peut |
|---|---|---|
| Super admin | Plateforme (`ADMIN_EMAILS` en amorçage, table `platform_admins`) | Créer des centres, tout voir, nommer un responsable de centre |
| Responsable de centre (`org_admin`) | Son centre | Recruter enseignants et examinateurs, gérer ses élèves, décider des inscriptions, corriger |
| Enseignant (`teacher`) | Son centre | Ajouter ses élèves (code d'accès), décider des inscriptions |
| Examinateur (`examiner`) | Un ou plusieurs centres | Corriger les évaluations des élèves de ces centres |
| Apprenant | Son profil | Ses compétences (code d'accès → session signée) |

Les permissions sont des fonctions pures dans `src/modules/organizations/domain/access.ts` (testées) ; les routes API les appliquent via `getAccessContext` (`src/lib/access-context.ts`).

## Données
- `organizations`, `memberships (user, organisation, rôle)`, `platform_admins`
- `organization_id` ajouté (défaut = société mère) sur `students`, `profiles`, `skill_enrollments`, `skill_evaluations`
- Un élève ajouté par un enseignant rejoint le centre de cet enseignant ; ses demandes d'inscription et évaluations portent ce centre

## Compatibilité avec l'existant
Migration additive : aucune ligne n'est modifiée, tout passe dans la société mère. Les super admins actuels (`ADMIN_EMAILS`) gardent tous leurs droits. Si la migration n'est pas appliquée, `getAccessContext` retombe sur `ADMIN_EMAILS` seul.

## Décision : catalogue commun
Le **catalogue de compétences, les banques de questions et les tarifs sont communs à tous les centres** (décision produit). Un centre ne personnalise ni le contenu ni les prix ; il recrute son équipe, a ses élèves, décide des inscriptions. Cela évite tout `organization_id` sur le catalogue, les questions et `pricing_plans`.

## Accès anonymes et isolation des centres
Les accès anonymes (visiteurs, profils de démonstration) restent possibles et sont **rattachés à la société mère**. Pour qu'un centre externe n'expose pas ses élèves :
- le navigateur enregistre XP et badges via `PUT /api/progress` dès qu'il y a une session (apprenant ou enseignant) : l'API vérifie que le profil appartient à l'appelant ;
- la migration `20261015000000_anon_parent_only.sql` remplace les politiques `anon … using (true)` de `profiles`, `scores`, `badges`, `quiz_answers`, `keyboard_progress` par des politiques limitées aux lignes de la société mère (**à appliquer avant d'ouvrir un centre externe**). Un enseignant connecté dans le navigateur passe par le rôle `authenticated`, pour lequel les anciennes politiques `anon` ne s'appliquaient pas : la synchro directe échouait déjà en silence, l'API la corrige.

## Risques restants
1. `parcours` et `parcours_enrollments` : lecture ouverte à tous ; `questions` et `release_notes` sans RLS.
2. Inscription en libre-service d'un apprenant (page publique du centre + code du centre) : non faite.
3. Les invitations d'enseignants passent par l'e-mail Supabase : le SMTP (Brevo) doit être configuré.
