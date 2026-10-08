'use client';

import { useRef } from 'react';
import { useLandingFlow } from '../application/useLandingFlow';
import { savePlacement, useSavedPlacements } from '../infra/placement-storage';
import { Hero } from './Hero';
import { FlowStepper } from './FlowStepper';
import { ModeChoice } from './ModeChoice';
import { SkillPicker } from './SkillPicker';
import { PlacementTest } from './PlacementTest';
import { PlacementResultView } from './PlacementResultView';
import { TeachersSection } from './TeachersSection';
import { PricingSection } from '@/modules/pricing';

/** Home page for visitors who are not signed in. */
export function LandingPage() {
  const saved = useSavedPlacements();
  const flow = useLandingFlow({ onResult: savePlacement });
  const flowRef = useRef<HTMLElement>(null);

  function goToFlow() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    flowRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    flowRef.current?.querySelector<HTMLElement>('#flow-title')?.focus({ preventScroll: true });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Hero onStart={goToFlow} />

      <section ref={flowRef} id="commencer" aria-labelledby="flow-title" className="mx-auto max-w-3xl px-4 pt-10 scroll-mt-4">
        <FlowStepper step={flow.step} />
        {flow.step === 'mode' && <ModeChoice mode={flow.mode} onChoose={flow.chooseMode} />}
        {flow.step === 'skill' && <SkillPicker saved={saved} onChoose={flow.chooseSkill} onChangeMode={flow.changeMode} />}
        {flow.step === 'test' && flow.skill && flow.question && (
          <PlacementTest skill={flow.skill} question={flow.question} index={flow.questionIndex}
            total={flow.questions.length} onAnswer={flow.answer} />
        )}
        {flow.step === 'result' && flow.skill && flow.result && (
          <PlacementResultView skill={flow.skill} result={flow.result} onAnotherSkill={flow.chooseAnotherSkill} />
        )}
      </section>

      <PricingSection />
      <TeachersSection onTryTest={goToFlow} />
    </main>
  );
}
