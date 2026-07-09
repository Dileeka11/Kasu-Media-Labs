import type { Metadata } from 'next';
import { getSiteData } from '../../lib/api';
import WorkClient from '../../components/WorkClient';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData();
  const studio = data?.studio_name || 'KML Production';
  const count = data?.projects?.length ?? 0;
  const description = `The full archive of ${studio}'s work${count ? ` — ${count} projects` : ''}: commercials, corporate films, documentaries, and social content.`;
  return {
    title: 'Selected Work',
    description,
    alternates: { canonical: '/work' },
    openGraph: {
      type: 'website',
      title: `Selected Work — ${studio}`,
      description,
    },
  };
}

export default async function WorkPage() {
  const data = await getSiteData();
  return <WorkClient initialData={data} />;
}
