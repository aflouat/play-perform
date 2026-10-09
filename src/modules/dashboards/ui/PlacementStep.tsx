'use client';

import { useEffect } from 'react';
import { useLandingFlow, SkillPicker, PlacementTest } from '@/modules/landing';
import { getSkillLevelFor, persistSkillLevel, setSkillLevel, type SkillLevelNumber } from '@/modules/skills';
import { applyStartLevel } from '../domain/onboarding';

/** Step 2 of the first connection: the 5-question level test of one skill; the result becomes the starting level. */
export function PlacementStep({ profileId, onDone }: { profileId: string; onDone: (skillId: string) => void }) {
  const flow = useLandingFlow({
    onResult: (skillId, result) => {
      setSkillLevel(profileId, skillId, applyStartLevel(getSkillLevelFor(profileId, skillId), result.startLevel) as SkillLevelNumber);
      persistSkillLevel(profileId, skillId);
    },
  });
  // The learner already has an access: no account question, straight to the skills
  useEffect(() => { flow.chooseMode('guest'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (flow.step === 'test' && flow.skill && flow.question) {
    return <PlacementTest skill={flow.skill} question={flow.question} index={flow.questionIndex} total={flow.questions.length} onAnswer={flow.answer} />;
  }
  if (flow.step === 'result' && flow.skill && flow.result) {
    return (
      <div role="status" className="space-y-3 rounded-2xl bg-white p-5 text-center text-slate-800">
        <p className="text-4xl" aria-hidden="true">🎉</p>
        <p className="font-black">Ton point de départ en {flow.skill.name} : niveau {flow.result.startLevel} sur 5</p>
        <button onClick={() => onDone((flow.skill as { id: string }).id)} className="w-full rounded-xl bg-violet-600 py-3 font-bold text-white">Continuer →</button>
      </div>
    );
  }
  return <div className="rounded-2xl bg-white p-4 text-slate-800"><SkillPicker saved={{}} onChoose={flow.chooseSkill} onChangeMode={() => undefined} /></div>;
}
