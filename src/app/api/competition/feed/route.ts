import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { loadFeed } from '@/modules/competition/server';
import { getSkillById } from '@/modules/skills/server';

/** GET ?profileId=… → the activity feed of my centre: pseudonyms, skills, levels, cheers. No ids of other learners. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
    const rows = await loadFeed(profileId);
    const events = rows.flatMap((r) => {
      const skill = getSkillById(r.skillId);
      return skill ? [{
        id: r.id, nickname: r.nickname, skillName: skill.name, skillEmoji: skill.emoji, level: r.level, createdAt: r.createdAt,
        cheers: r.cheers, cheeredByMe: r.cheeredByMe, isMine: r.profileId === profileId,
      }] : [];
    });
    return NextResponse.json({ events });
  } catch (err) {
    console.error('[GET /api/competition/feed]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
