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

## Risques connus (à traiter avant le premier centre externe)
1. **Politiques `anon` permissives** sur `profiles`, `scores`, `badges`, `quiz_answers`, `keyboard_progress` (`using (true)`), conservées volontairement pour les accès anonymes de la société mère. Avec des centres externes, un détenteur de la clé publique pourrait lire ou écrire les lignes de leurs élèves. Correctif prévu : limiter ces politiques aux lignes de la société mère et faire passer la synchro des scores des autres centres par une API authentifiée (jeton apprenant).
2. `parcours` et `parcours_enrollments` : lecture ouverte à tous ; `questions` et `release_notes` sans RLS.
3. Catalogue de compétences (`SKILLS_SEED`), questions et tarifs (`pricing_plans`) encore globaux : un centre ne peut pas avoir les siens.
4. Inscription en libre-service d'un apprenant (page publique du centre + code du centre) : non faite.
5. Les invitations d'enseignants passent par l'e-mail Supabase : le SMTP (Brevo) doit être configuré.
