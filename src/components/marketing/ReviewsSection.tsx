import { Box, Container, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { FC } from 'react';

import { LANDING_REVIEWERS } from '../../data/landingReviews';
import { pickLandingReviews } from '../../utils/pickLandingReviews';

import { ReviewCard } from './ReviewCard';

export const ReviewsSection: FC = () => {
  const displayedReviews = useMemo(() => pickLandingReviews(LANDING_REVIEWERS), []);

  return (
    <Box
      sx={{
        py: { md: 8, xs: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Typography component="h3" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }} variant="h4">
          Dungeon Masters love Encounter Runner!
        </Typography>
        <Grid container spacing={2}>
          {displayedReviews.map(review => (
            <Grid key={review.id} size={{ md: 6, xs: 12 }}>
              <ReviewCard review={review} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
