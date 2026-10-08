'use client';

import { useEffect } from 'react';
import { claimVisitorPlacements } from '@/modules/landing';
import { syncSkillLevels } from '@/modules/skills';
import { isProfileReady } from '@/hooks/useActiveProfileId';

/**
 * On entering the skills area: take over the visitor's placement results (first profile only),
 * then reconcile the levels of this device with the database.
 */
export function useSkillBootstrap(profileId: string): void {
  useEffect(() => {
    if (!isProfileReady(profileId)) return;
    claimVisitorPlacements(profileId);
    void syncSkillLevels(profileId);
  }, [profileId]);
}
