import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

import { AppLayout } from '../components/AppLayout';
import { FeatureSection } from '../components/marketing/FeatureSection';
import { FinalCtaSection } from '../components/marketing/FinalCtaSection';
import { HeroSection } from '../components/marketing/HeroSection';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { PublicHeader } from '../components/marketing/PublicHeader';

interface Features {
  description: string;
  imagePosition: 'left' | 'right';
  title: string;
}

const FEATURES: readonly Features[] = [
  {
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Create campaigns, share invite links with your party, and keep every session organized in one workspace.',
    imagePosition: 'right',
    title: 'Campaign management',
  },
  {
    description:
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Track armor class, hit points, and level for every character in your roster — ready to drop into any encounter.',
    imagePosition: 'left',
    title: 'Character roster',
  },
  {
    description:
      'Ut enim ad minim veniam, quis nostrud exercitation. Run initiative order, apply effects, and log combat events in real time so nothing gets lost between turns.',
    imagePosition: 'right',
    title: 'Encounter runner',
  },
];

const IndexComponent: FC = () => (
  <AppLayout header={<PublicHeader />}>
    <HeroSection />
    {FEATURES.map(feature => (
      <FeatureSection
        description={feature.description}
        imagePosition={feature.imagePosition}
        key={feature.title}
        title={feature.title}
      />
    ))}
    <FinalCtaSection />
    <MarketingFooter />
  </AppLayout>
);

export const Route = createFileRoute('/')({
  component: IndexComponent,
});
