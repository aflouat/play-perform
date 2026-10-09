# Ergonomie : apprenant (B2C) et centre de formation (B2B)

Deux publics aux attentes opposées sur un même site. Règle : **deux portes distinctes, jamais mélangées**.

| | Apprenant (B2C) | Centre de formation (B2B) |
|---|---|---|
| Ton | Énergique, tutoiement, verbes d'action | Sobre, vouvoiement, factuel |
| Visuel | Violet / ambre, grands boutons, emojis | Gris ardoise, boutons compacts |
| Appel à l'action | « Je commence mon apprentissage » | « Gérer mon centre de formation » |
| Entrée | Bouton principal de l'en-tête et du hero ; `/connexion` (carte large) | Bandeau sombre au-dessus de l'en-tête (visiteurs), section dédiée de l'accueil, carte discrète de `/connexion` |
| Connexion | Code d'accès (`/apprenant`), sans mot de passe | E-mail + mot de passe (`/auth`), inscription par dossier (`/centre/inscription`) |

## Règles appliquées
1. Le lien du centre n'est **jamais dans le même bloc de boutons** que celui de l'apprenant (bandeau à part, section à part).
2. Le hero et le portail n'ont qu'un bouton principal : celui de l'apprenant. Aucun lien « centre » dans la carte apprenant, aucun lien « apprentissage » dans la carte centre (testé).
3. Une fois connecté, **chacun ne voit que son espace** : l'apprenant (Ma ville, Compétition) n'a aucun lien vers `/enseignant` ou `/admin` ; le centre (Mon centre, Corrections, Inscriptions, Équipe) n'a aucun lien vers l'espace apprenant. Un seul rôle par appareil.
4. Les anciens appels « Espace apprenant » / « Espace enseignant » deviennent des verbes d'action.
5. Les CTA destinés aux apprenants ne mènent jamais à la connexion du centre : « Entrer mon code d'accès » (`/apprenant`).

## Inscription d'un centre
Formulaire unique : responsable (e-mail, mot de passe) + identité légale (raison sociale, SIREN, SIRET de l'établissement, adresse). Contrôles : somme de contrôle de Luhn sur SIREN et SIRET, SIRET commençant par le SIREN, un SIRET = un centre. Le dossier est examiné par la société mère (`/admin/organisations`) : elle vérifie l'établissement puis ouvre le centre, ce qui crée l'organisation et nomme le demandeur responsable. En attendant, un bandeau « dossier en cours d'examen » s'affiche dans « Mon centre ».

La vérification automatique auprès de l'API Sirene (INSEE) reste à faire : aujourd'hui le contrôle d'existence de l'établissement est manuel.
