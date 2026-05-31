# FAQ — Utilisateur XXXL · Play & Perform

> Ce guide s'adresse aux utilisateurs qui veulent tirer le maximum de la plateforme.
> Toutes les règles décrites ici correspondent au code en production.

---

## 1. Présentation générale

### Qu'est-ce que Play & Perform ?

**Play & Perform** est une plateforme d'apprentissage gamifiée pour enfants, accessible sur navigateur et mobile. Elle propose trois expériences distinctes selon le profil de l'enfant, avec un système de progression XP, de répétition espacée, et deux modes d'apprentissage.

### Qui peut utiliser la plateforme ?

La plateforme est conçue pour trois profils précis :

| Profil | Âge | Activité | Accès |
|---|---|---|---|
| 🧑‍🎓 **Omar** | 12 ans | Quiz toutes matières | `/home` → `/quiz/[matière]` |
| 🌸 **Esma** | 9 ans | Reconnaissance de mots (FR/EN/ES) | `/esma` |
| 🚀 **Mohamed** | 6 ans | Clavier, mots, sciences | `/keyboard` |

### Où est hébergée la plateforme ?

**Production : https://play-perform.vercel.app**

Base de données : Supabase (région Paris `eu-west-3`), tables `profiles`, `scores`, `badges`, `quiz_answers`, `keyboard_progress`.

---

## 2. Connexion et profils

### Comment choisir son profil ?

L'écran d'accueil (`/`) affiche les 3 profils. Un tap/clic suffit. Pas de mot de passe — la sélection est mémorisée en `localStorage` sous la clé `activeProfile`.

### Le profil est-il sauvegardé entre les sessions ?

Oui, le profil actif et tout le score sont persistés en `localStorage`. Les scores sont également synchronisés en arrière-plan avec Supabase (fire-and-forget, non bloquant). Si vous utilisez un nouvel appareil, le score repart de zéro localement.

### Comment revenir à l'écran de sélection ?

Appuyez sur la flèche `←` en haut à gauche de n'importe quelle page.

### Peut-on ajouter un nouveau profil ?

Le bouton « Ajouter un profil » est visible mais désactivé. Cette fonctionnalité est prévue dans une prochaine release.

---

## 3. Système de score et XP

### Comment fonctionne l'XP ?

Chaque bonne réponse rapporte des points d'expérience (XP) :

| Action | XP gagné |
|---|---|
| Bonne réponse quiz (facile) | 10 XP |
| Bonne réponse quiz (moyen) | 15 XP |
| Bonne réponse quiz (difficile) | 20 XP |
| Quiz parfait (toutes bonnes) | +20 XP bonus |
| Lettre clavier Mohamed | 5 XP |
| Mot complet Mohamed | 10 XP |
| Question science Mohamed | 15 XP |
| Mot Esma | 8 XP |

### Comment progresser en niveaux ?

**100 XP = 1 niveau.** La formule est linéaire : niveau 1 = 0 XP, niveau 2 = 100 XP, niveau 3 = 200 XP, etc.

La barre XP dans le header montre la progression dans le niveau en cours. L'animation `score-pop` et le badge flottant `+N XP` s'affichent à chaque gain.

### Quels sont les badges disponibles ?

| Badge | Emoji | Condition de déverrouillage |
|---|---|---|
| Premier Quiz | 🎯 | Premier gain d'XP (toute activité) |
| Quiz parfait | ⭐ | Toutes les réponses correctes en une session |
| Chercheur·euse | 🔍 | 500 XP cumulés au total |
| 3 jours de suite | 🔥 | (streak, en cours d'implémentation) |
| Une semaine ! | ⚡ | (streak, en cours d'implémentation) |
| Rapide ! | 💨 | (temps, en cours d'implémentation) |

Les badges sont permanents et visibles sur la page home.

---

## 4. Avatars

### Quels avatars sont disponibles ?

| Avatar | Emoji | XP requis |
|---|---|---|
| Astronaute | 🧑‍🚀 | 0 XP (dès le début) |
| Scientifique | 🧪 | 0 XP (dès le début) |
| Ninja | 🥷 | 0 XP (dès le début) |
| Explorateur·ice | 🗺️ | 100 XP |
| Sorcier·ère | 🧙 | 250 XP |
| Robot | 🤖 | 500 XP |

Un avatar verrouillé affiche le verrou 🔒 et l'XP requis. Il se déverrouille automatiquement quand le seuil est atteint.

### Comment changer d'avatar ?

Sur la page home : bouton `▼ Changer d'avatar`. Dans le quiz : le picker est accessible via l'emoji en haut du header. La sélection est mémorisée par profil en `localStorage`.

---

## 5. Modes d'apprentissage

### Quels sont les deux modes ?

| Mode | Emoji | Comportement |
|---|---|---|
| **Avancé** | 🚀 | Travail autonome, pas d'aide automatique |
| **Assisté** | 🤝 | Sons automatiques, emoji agrandi, bouton Indice dispo |

### Quel mode est activé par défaut ?

- **Omar** : Avancé 🚀
- **Mohamed** : Avancé 🚀
- **Esma** : Assisté 🤝 (adapté à ses besoins spécifiques)

### Comment basculer de mode ?

Le badge de mode (ex. « 🚀 Avancé ») est cliquable dans chaque header. Un tap bascule entre les deux modes. Le choix est mémorisé par profil en `localStorage`.

### Que change le mode Assisté exactement ?

En mode Assisté :
- ✅ La question est **lue automatiquement** à voix haute (TTS) à l'affichage
- ✅ Le bouton **🔊** est toujours visible
- ✅ Le bouton **💡 Indice** apparaît sur chaque question
- ✅ Les emoji/visuels sont **plus grands**
- ✅ Les zones de tap sont **plus larges**
- ✅ Après une bonne réponse : phrase enthousiaste + mot prononcé à voix haute

### Que fait le bouton Indice ?

**1 indice par question, non rechargeable.**

| Jeu | Effet de l'indice |
|---|---|
| Quiz Omar | Élimine 1 mauvaise réponse (grisée) + TTS lit la question |
| Esma (mots) | Barre 1 option incorrecte + TTS prononce le mot cible |
| Mohamed Lettres | TTS indique la rangée clavier (milieu/haut/bas) |
| Mohamed Mots | TTS épelle le mot lettre par lettre |
| Mohamed Sciences | Élimine 1 mauvaise réponse + TTS reprend la question |

---

## 6. Répétition espacée (SRS)

### Comment fonctionne le système de répétition espacée ?

Play & Perform utilise l'algorithme **SM-2** (SuperMemo 2) — le même principe que Anki.

Chaque question a un état :

| État | Signification |
|---|---|
| `new` | Jamais vue |
| `learning` | Vue, réponse incorrecte → à revoir demain |
| `review` | Vue et correcte → à revoir dans quelques jours |
| `mastered` | Correcte depuis ≥ 21 jours d'intervalle |

### Comment l'intervalle de révision évolue-t-il ?

- **1ère bonne réponse** → à revoir dans 1 jour
- **2ème bonne réponse** → à revoir dans 4 jours
- **Suivantes** → intervalle × facteur de facilité (1,3 à 2,5)
- **Mauvaise réponse** → retour à 1 jour, facteur réduit de 0,2

Une question est **maîtrisée** quand son intervalle dépasse 21 jours.

### Dans quel ordre les questions sont-elles présentées ?

**Priorité : dues > nouvelles > maîtrisées**

1. Questions dont la date de révision est passée (triées de la plus ancienne)
2. Questions jamais vues (ordre aléatoire)
3. Questions maîtrisées (de remplissage si la session est trop courte)

### Comment voir la progression SRS sur la home ?

Sur chaque carte de matière :
- **Chiffre orange** = nombre de questions dues à revoir aujourd'hui
- **✓ vert** = toutes les questions de cette matière sont maîtrisées
- **Pas de badge** = tout est nouveau (jamais touché)

### Où est stockée la progression SRS ?

En `localStorage`, clé `srs:{profileId}:{subject}`. La progression est par profil et par matière. Elle n'est pas encore synchronisée avec Supabase (à venir).

---

## 7. Matières et banque de questions

### Quelles matières sont disponibles pour Omar ?

**14 matières** au total, toutes accessibles depuis la home :

| Matière | Emoji | Questions |
|---|---|---|
| Mathématiques | 🧮 | 8 |
| Français | 📝 | 5 |
| SVT | 🔬 | 4 |
| Histoire-Géo | 🏛️ | 4 |
| Physique-Chimie | ⚡ | 4 |
| Espace | 🚀 | 10 |
| Météo | 🌦️ | 8 |
| Chimie | ⚗️ | 8 |
| Mécanique | ⚙️ | 8 |
| Géographie | 🌍 | 9 |
| Anglais | 🇬🇧 | 9 |
| Espagnol | 🇪🇸 | 8 |
| Informatique | 💻 | 8 |
| Télécom | 📡 | 8 |

### Combien de questions par session de quiz ?

**5 questions** par session (sélectionnées par le SRS).

### Les questions ont-elles des visuels ?

Oui. Chaque question possède un champ `emoji` affiché au-dessus de l'énoncé. En mode Assisté, l'emoji est 1,5× plus grand.

---

## 8. Jeu Mohamed — Clavier

### Quels modes de jeu Mohamed propose-t-il ?

3 onglets accessibles en haut de la page `/keyboard` :

| Mode | Description | XP par réussite |
|---|---|---|
| 🔤 **Lettres** | Tapez la lettre affichée (clavier physique ou bouton écran) | 5 XP |
| 📝 **Mots** | Tapez un mot complet lettre par lettre (clavier physique) | 10 XP |
| 🔬 **Sciences** | QCM de découverte scientifique (3 options) | 15 XP |

### Comment fonctionnent les niveaux du mode Lettres ?

4 niveaux progressifs :

| Niveau | Touches |
|---|---|
| N1 | a, s, d, f, j, k, l (rangée du milieu) |
| N2 | q, w, e, r, t, y, u, i, o, p (rangée du haut) |
| N3 | z, x, c, v, b, n, m (rangée du bas) |
| N4 | Les 26 lettres mélangées |

### Le mode Mots fonctionne-t-il sur tablette/mobile ?

Le mode Mots nécessite un **clavier physique** pour taper les lettres. Le mode Lettres propose en plus un grand bouton tactile à l'écran.

### Que se passe-t-il à la fin d'une session Mohamed ?

L'écran « 🏆 Mission accomplie ! » s'affiche avec les sons `levelup`. Boutons : **Accueil** ou **Rejouer**.

---

## 9. Jeu Esma — Mots

### Comment se joue le jeu Esma ?

Chaque tour : un emoji géant s'affiche → Esma tape sur le bon mot parmi 3 choix.

- **6 questions** par session
- **3 langues** : Français 🇫🇷, English 🇬🇧, Español 🇪🇸 (switcher en haut)
- **Bouton 🔊** : TTS prononce le mot cible dans la bonne langue
- **Mode Assisté** (défaut) : le mot est lu automatiquement + bouton Indice disponible

### Comment la langue est-elle mémorisée ?

La langue est réinitialisée à Français à chaque nouvelle session. Elle n'est pas persistée.

---

## 10. Audio et voix

### Quels sons sont disponibles ?

| Son | Déclencheur |
|---|---|
| ✅ Correct | Bonne réponse |
| ❌ Wrong | Mauvaise réponse |
| 🎵 Complete | Fin de session réussie |
| ⬆️ Level-up | Écran de fin Mohamed |
| 🖱️ Click | Tap rapide |

Les sons sont générés **localement** par la Web Audio API (aucun fichier externe).

### Comment fonctionne la voix enthousiaste ?

En mode Assisté, après une bonne réponse :
1. Une **interjection aléatoire** est dite ("Super !", "Bravo !", "Génial !", "Fantastique !")
2. Puis le **mot ou l'explication** est lu

La voix utilise la SpeechSynthesis API du navigateur. La meilleure voix locale disponible est sélectionnée automatiquement (priorité aux voix `localService`).

### La voix fonctionne-t-elle hors ligne ?

Oui, si le navigateur a des voix TTS locales installées. Sur iOS/macOS, les voix locales sont très naturelles. Sur Android, elles varient selon le système.

---

## 11. Données et confidentialité

### Où sont stockées les données ?

| Donnée | Stockage |
|---|---|
| Profil actif | `localStorage` (clé `activeProfile`) |
| Score, niveau, badges | `localStorage` + sync Supabase |
| Progression SRS | `localStorage` uniquement |
| Avatar choisi | `localStorage` (clé `avatar:{profileId}`) |
| Mode apprentissage | `localStorage` (clé `mode:{profileId}`) |

### La progression est-elle perdue si on vide le cache ?

Oui pour la progression SRS (localStorage uniquement). Non pour le score XP/badges si Supabase est disponible (les données seront réhydratées à la prochaine connexion — cette fonctionnalité est partiellement implémentée).

### Les données sont-elles partagées ?

Non. Il n'y a pas d'authentification, pas de compte utilisateur, pas de tracking publicitaire. Supabase est utilisé uniquement pour persister les scores.

---

## 12. Astuces XXXL

### Comment progresser le plus vite possible en XP ?

1. **Enchaîner les sessions Sciences Mohamed** (15 XP/question × 5 = 75 XP par session)
2. **Réussir des quiz parfaits** (toutes les réponses correctes = +20 XP bonus)
3. **Varier les matières** pour activer le SRS sur toutes → chaque nouvelle matière = 8-10 questions "new" à 10-15 XP chacune

### Comment débloquer le Robot 🤖 (avatar max) le plus vite ?

Il faut **500 XP**. La stratégie optimale :
- 5 sessions sciences Mohamed (75 XP × 5 = 375 XP)
- 3 quiz parfaits toutes matières (≈ 70 XP × 3 = 210 XP)
- Total ≈ 585 XP → Robot débloqué.

### Comment voir quelles questions sont dues aujourd'hui ?

Sur la home Omar, les matières avec un **badge orange** ont des questions à revoir. Cliquez dessus en priorité — la session démarrera avec les questions les plus urgentes.

### Peut-on utiliser Play & Perform sans connexion internet ?

Oui. Toute la logique est côté client. Sans connexion, la synchronisation Supabase ne se fait pas, mais le jeu fonctionne entièrement en local.

### Le mode Assisté ralentit-il la progression ?

Non. Le mode Assisté accorde exactement le même XP que le mode Avancé. Il ajoute simplement des aides. Pour les apprenants ayant besoin de soutien (comme Esma), c'est le mode recommandé.

### Comment réinitialiser sa progression SRS sur une matière ?

Ouvrez la console du navigateur et tapez :
```javascript
localStorage.removeItem('srs:omar:maths')
```
Remplacer `omar` par le profileId et `maths` par la matière concernée.

### Y a-t-il un classement entre profils ?

Pas encore. Cette fonctionnalité est dans la roadmap (`todo.md` : « Mode compétition amicale »).

---

## 13. Roadmap (prochaines releases)

Ce qui est confirmé dans le backlog :

- ⏳ Synchronisation Supabase pour la progression SRS
- ⏳ Authentification (email/Google)
- ⏳ Dashboard parent (suivi de progression)
- ⏳ Streak quotidien actif avec badge
- ⏳ Extension des banques de questions (20+ par matière)
- ⏳ Contenu Lab World (Python, stats, visualisation pour Omar)
- ⏳ Nouveau profil "Ajouter" fonctionnel
- ⏳ Export portfolio de compétences

---

*Dernière mise à jour : 2026-05-30 · Version : Play & Perform v1.0-stable*
