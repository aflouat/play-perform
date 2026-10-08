# Module `skills`

**Responsabilité** : compétences à acquérir et chemin de niveaux 1 → 5.

## API publique (`index.ts`)
- `getSkills()`, `getSkillById(id)` — compétences (seed local pour le POC)
- `SKILL_LEVELS`, `getSkillLevel(n)` — libellés des 5 niveaux
- `getSkillLevelFor`, `setSkillLevel`, `advanceSkillLevel`, `getAllSkillLevels` — niveau 1→5 par profil et par compétence (localStorage ; l'XP, elle, reste au compte)
- Types : `Skill`, `SkillLevelNumber`, `SkillLevelInfo`

## Structure
- `domain/skill.ts` — entités et niveaux (pur)
- `infra/skills-seed.ts` — 9 compétences (collège / lycée + Claude Platform)

## À venir (Étape 3)
`SkillLink` (réseau étoilé), `SkillPath` / `Level` / `Step`, `Progress`, événements `StepCompleted`, `LevelCompleted`.
