import { getAuthToken } from '@/lib/auth-token';
import type { DiplomaGap } from '../domain/diploma';

export interface DiplomaData {
  firstName: string; lastName: string; skillName: string; skillEmoji: string; levelLabel: string;
  centreName: string | null; issuedOn: string; reference: string;
}
export interface DiplomaResponse { eligible: boolean; missing: DiplomaGap[]; diploma: DiplomaData | null }

export async function fetchDiploma(profileId: string, skillId: string): Promise<DiplomaResponse | null> {
  try {
    const res = await fetch(`/api/diploma?profileId=${encodeURIComponent(profileId)}&skillId=${encodeURIComponent(skillId)}`, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    return res.ok ? ((await res.json()) as DiplomaResponse) : null;
  } catch { return null; }
}
