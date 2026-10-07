import { q } from './placement-question';

/** Placement questions — physique-chimie, anglais, logique, méthode. Index of the right option is the last argument. */
export const PLACEMENT_BANK_B = [
  q('physique-energie', 1, 'À quelle température l’eau pure gèle-t-elle (pression normale) ?', ['10 °C', '0 °C', '−10 °C', '100 °C'], 1),
  q('physique-energie', 2, 'Quelle est l’unité de l’énergie dans le Système international ?', ['Le watt', 'Le volt', 'Le newton', 'Le joule'], 3),
  q('physique-energie', 3, 'Une voiture parcourt 150 km en 2 h. Quelle est sa vitesse moyenne ?', ['75 km/h', '300 km/h', '50 km/h', '152 km/h'], 0),
  q('physique-energie', 4, 'D’après la loi d’Ohm, si U = 12 V et R = 4 Ω, quelle est l’intensité I ?', ['48 A', '16 A', '3 A', '0,33 A'], 2),
  q('physique-energie', 5, 'Quelle est l’énergie cinétique d’un objet de 2 kg qui se déplace à 3 m/s ?', ['6 J', '9 J', '18 J', '3 J'], 1),

  q('anglais-comprendre', 1, 'Comment dit-on « bonjour » le matin en anglais ?', ['Good night', 'Goodbye', 'Good evening', 'Good morning'], 3),
  q('anglais-comprendre', 2, 'Choose the correct sentence:', [
    'She goes to school every day.', 'She go to school every day.', 'She going to school every day.', 'She gone to school every day.'], 0),
  q('anglais-comprendre', 3, 'Complete: « Yesterday, I ___ a great film. »', ['see', 'have seen', 'saw', 'seeing'], 2),
  q('anglais-comprendre', 4, 'Que signifie « I have been living here for five years » ?', [
    'J’ai vécu ici il y a cinq ans', 'J’habite ici depuis cinq ans', 'J’habiterai ici dans cinq ans', 'J’habitais ici pendant cinq ans'], 1),
  q('anglais-comprendre', 5, 'Complete: « If I ___ more time, I would travel the world. »', ['have', 'will have', 'would have', 'had'], 3),

  q('logique', 1, 'Quel nombre continue la suite : 2, 4, 6, 8, … ?', ['9', '12', '10', '16'], 2),
  q('logique', 2, 'Quel nombre continue la suite : 1, 3, 9, 27, … ?', ['81', '36', '54', '30'], 0),
  q('logique', 3, 'Tous les chats sont des mammifères. Mon animal est un chat. Que peut-on conclure ?', [
    'Tous les mammifères sont des chats', 'Mon animal est un mammifère', 'Mon animal n’est pas un mammifère', 'On ne peut rien conclure'], 1),
  q('logique', 4, '« S’il pleut, alors le sol est mouillé. » Le sol n’est pas mouillé. Que peut-on conclure ?', [
    'Il pleut', 'Le sol va bientôt être mouillé', 'On ne peut rien conclure', 'Il ne pleut pas'], 3),
  q('logique', 5, 'Pendant une course, tu doubles la personne qui est deuxième. À quelle place es-tu ?', ['Premier', 'Troisième', 'Deuxième', 'Dernier'], 2),

  q('methode', 1, 'Quelle est la meilleure façon de retenir une leçon ?', [
    'La lire une seule fois la veille', 'La recopier sans la relire', 'L’écouter en faisant autre chose',
    'La revoir plusieurs fois en s’interrogeant, à quelques jours d’intervalle'], 3),
  q('methode', 2, 'Avant de commencer un exercice, que vaut-il mieux faire ?', [
    'Répondre au hasard pour gagner du temps', 'Lire toute la consigne et repérer les mots-clés',
    'Commencer par la dernière question', 'Demander directement la correction'], 1),
  q('methode', 3, 'Tu as un contrôle dans 10 jours. Quel planning est le plus efficace ?', [
    'Réviser un peu, plusieurs fois, en espaçant les séances', 'Tout réviser la veille au soir',
    'Réviser seulement le matin du contrôle', 'Réviser 10 heures le premier jour puis plus rien'], 0),
  q('methode', 4, 'À quoi sert une carte mentale ?', [
    'À décorer son cahier', 'À remplacer complètement le cours', 'À organiser les idées autour d’une notion centrale', 'À apprendre mot à mot'], 2),
  q('methode', 5, 'Pourquoi se tester (auto-interrogation) est-il plus efficace que relire ?', [
    'C’est plus rapide', 'Cela oblige à aller rechercher l’information en mémoire, ce qui la renforce',
    'Cela dispense d’apprendre', 'Cela ne marche qu’en mathématiques'], 1),
];
