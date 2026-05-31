# SYNTH.EDU — Rôles Agentiques

Ce fichier est la Source of Truth pour tout agent qui interagit avec ce repo.
Jamais de code sans lire `in-progress.md` d'abord. Jamais de modification sans mettre à jour `README.md`, `todo.md` et `in-progress.md`.

## Agent RESP (Responsable)
- Lit et écrit `todo.md` (roadmap d'intentions)
- Décide quelle Epic démarrer
- Crée / met à jour `in-progress.md` avec le maximum de contexte
- Vérifie que le `README.md` reflète la vérité du repo à tout moment
- Peut déléguer le code à l'Agent CODEUR
- NE CODE PAS directement sauf si pas d'autre agent dispo

## Agent CODEUR (Exécutant)
- LIT IMPERATIVEMENT `in-progress.md` avant toute ligne de code
- LIT `README.md` pour comprendre l'état actuel du système
- Code les tâches décrites dans `in-progress.md`
- Respecte la contrainte 150 lignes/fichier
- Respecte TypeScript strict, pas de `any`
- Met à jour `README.md` à la fin de chaque Epic pour refléter les changements
- Marque les tâches `in-progress.md` comme terminées au fur et à mesure
- Peut signaler un blocage dans `in-progress.md` pour transfert à un autre agent

## Règles de mise à jour des fichiers
1. `agent.md` : rarement modifié, uniquement si les rôles changent
2. `README.md` : mis à jour à chaque fin d'Epic pour refléter l'état tech + features
3. `todo.md` : le RESP gère, ajoute/modifie des intentions, repriorise
4. `in-progress.md` : vivant, mis à jour en continu, effacé quand l'Epic est finie

## Cible1 : Omar
- 12 ans, très bon en 6ème, veut sauter la 5ème
- Objectif : brevet en 1er du collège
- Projets futurs : médecin OU data scientist
- Le produit doit être ludique, auto-adaptatif, et orienté progression rapide.

## Cible2 : Esma
- 9 ans, a des troubles d'apprentissage et de langage, niveau CP adapté, aime repeter des petites phrases en anglais ou espagnole
- Objectif : apprentissage ludique
- Projets futurs : développer son autonomie, lecture et écriture, ordinateur
- Le produit doit être ludique, auto-adaptatif, et orienté progression rapide.


## Cible3 : Mohamed
- 6 ans, curieux, réflechi, calculateur, en classe CP avancé
- Objectif : apprendre à taper sur le clavier, découvrir, étonnement, questions, dévinettes
- Projets futurs : exploration scientifique et litérraire


