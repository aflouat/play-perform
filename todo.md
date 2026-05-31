# TODO — Play Perform - supprimer les actions réalisées


## Priorité 1 — Contenu

- [ ] Plus de mots pour le niveau initié (actuellement 8 par langue) → 30+ par langue
- [ ] Phrases simples pour le mode assisté (pas seulement mots isolés)
- [ ] Niveaux 3-4  mots à taper pour le niveau initié

## Priorité 2 — Admin / Qualité
- ajouter un lien vers l'admin accessible pour les users de type admin
- ajouter un template csv telechargeable pour aider a l'import de données avec un onglet sur les regles a respecter pour que l'import des questions passe
- ajouter un exercice de revision accessible apres chaque quiz pour lequel au moins une question a eu une reponse fausse pour aider a reviser comme anki
- Pour calculer la prochaine date de révision, on applique un coefficient multiplicateur (Facteur de Facilité ou Ease Factor) à l'intervalle actuel dès qu'une session se termine sans faute.{Nouvel Intervalle} = {Intervalle Précédent} * {Facteur d'Ajustement}$$ Si l'enfant réussit tout parfaitement, l'intervalle double ou triple (ex: 1 jour ➔ 3 jours ➔ 7 jours). S'il a des lacunes, l'intervalle retombe à 1 jour.
- [ ] Configurer env vars prod (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL, ADMIN_EMAILS)
- [ ] Checklist item 6 : admin liste élèves avec suivi progression
- [ ] Streak quotidien visible sur la page d'accueil
- [ ] Tests e2e Playwright à jour

## Priorité 3 — Features futures

- [ ] Compétition live (strike entre joueurs, récompenses supervisées)
- [ ] Mode compétition classement
- [ ] Dashboard parent avec suivi progression de chaque élève
- [ ] Export portfolio compétences d'un eleve
