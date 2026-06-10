import { Box, Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { FC } from 'react';

import { LANDING_REVIEW_DISPLAY_COUNT, LANDING_REVIEWERS } from '../../data/landingReviews';
import { pickLandingReviews } from '../../utils/pickLandingReviews';

import { ReviewCard } from './ReviewCard';

const MARQUEE_ROW_GAP = 2;
const MARQUEE_TRACK_GAP = 2;

interface MarqueeRowProps {
  animationDirection: 'left' | 'right';
  animationDurationSeconds: number;
  reviews: ReturnType<typeof pickLandingReviews>;
}

const MarqueeRow: FC<MarqueeRowProps> = ({ animationDirection, animationDurationSeconds, reviews }) => {
  const trackReviews = [...reviews, ...reviews];

  return (
    <Box
      sx={{
        '@keyframes reviewsMarqueeLeft': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        '@keyframes reviewsMarqueeRight': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          overflowX: 'auto',
        },
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Stack
        direction="row"
        spacing={MARQUEE_TRACK_GAP}
        sx={{
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            width: 'max-content',
          },
          animation:
            animationDirection === 'left'
              ? `reviewsMarqueeLeft ${String(animationDurationSeconds)}s linear infinite`
              : `reviewsMarqueeRight ${String(animationDurationSeconds)}s linear infinite`,
          width: 'max-content',
        }}
      >
        {trackReviews.map((review, index) => (
          <ReviewCard key={`${review.id}-${String(index)}`} review={review} />
        ))}
      </Stack>
    </Box>
  );
};

export const ReviewsSection: FC = () => {
  const displayedReviews = useMemo(
    () =>
      pickLandingReviews(LANDING_REVIEWERS, {
        count: LANDING_REVIEW_DISPLAY_COUNT,
        random: Math.random,
      }),
    [],
  );

  const firstRowReviews = displayedReviews.slice(0, 5);
  const secondRowReviews = displayedReviews.slice(5, 10);

  return (
    <Box
      sx={{
        overflow: 'hidden',
        py: { md: 8, xs: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Typography component="h3" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }} variant="h4">
          Dungeon Masters love Encounter Runner!
        </Typography>
      </Container>
      <Stack spacing={MARQUEE_ROW_GAP}>
        <MarqueeRow animationDirection="left" animationDurationSeconds={45} reviews={firstRowReviews} />
        <MarqueeRow animationDirection="right" animationDurationSeconds={55} reviews={secondRowReviews} />
      </Stack>
    </Box>
  );
};
