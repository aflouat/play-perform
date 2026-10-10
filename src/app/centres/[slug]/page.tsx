import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CentreLanding, centreMetadata } from '@/modules/storefront';
import { countOpenSlots, getPublicCentre } from '@/modules/storefront/server';
import { offeredPaths } from '@/modules/dashboards/server';

type Props = { params: Promise<{ slug: string }> };

/** One local page per centre (franchise): its own title and description for search engines. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const centre = await getPublicCentre((await params).slug).catch(() => null);
  return centre ? centreMetadata(centre) : { title: 'Centre introuvable | Play Perform' };
}

export default async function CentrePage({ params }: Props) {
  const centre = await getPublicCentre((await params).slug).catch(() => null);
  if (!centre) notFound();
  const [paths, openSlots] = await Promise.all([offeredPaths(), countOpenSlots(centre.id).catch(() => 0)]);
  return <CentreLanding centre={centre} paths={paths} openSlots={openSlots} />;
}
