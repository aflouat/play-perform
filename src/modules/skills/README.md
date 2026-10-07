# Module `skills`

**Responsabilité** : compétences à acquérir et chemin de niveaux 1 → 5.

## API publique (`index.ts`)
- `getSkills()`, `getSkillById(id)` — compétences (seed local pour le POC)
- `SKILL_LEVELS`, `getSkillLevel(n)` — libellés des 5 niveaux
- Types : `Skill`, `SkillLevelNumber`, `SkillLevelInfo`

## Structure
- `domain/skill.ts` — entités et niveaux (pur)
- `infra/skills-seed.ts` — 8 compétences collège / lycée

## À venir (Étape 3)
`SkillLink` (réseau étoilé), `SkillPath` / `Level` / `Step`, `Progress`, événements `StepCompleted`, `LevelCompleted`.
