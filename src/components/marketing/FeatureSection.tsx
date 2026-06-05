import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import { PlaceholderImage } from './PlaceholderImage';

interface FeatureSectionProps {
  description: string;
  imagePosition: 'left' | 'right';
  title: string;
}

export const FeatureSection: FC<FeatureSectionProps> = ({ description, imagePosition, title }) => {
  const textContent = (
    <Stack spacing={2} sx={{ justifyContent: 'center' }}>
      <Typography component="h3" variant="h4">
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body1">
        {description}
      </Typography>
    </Stack>
  );

  const imageContent = <PlaceholderImage label={`${title} screenshot`} />;

  return (
    <Box sx={{ py: { md: 6, xs: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          {imagePosition === 'left' ? (
            <>
              <Grid size={{ md: 6, xs: 12 }}>{imageContent}</Grid>
              <Grid size={{ md: 6, xs: 12 }}>{textContent}</Grid>
            </>
          ) : (
            <>
              <Grid size={{ md: 6, xs: 12 }} sx={{ order: { md: 1, xs: 2 } }}>
                {textContent}
              </Grid>
              <Grid size={{ md: 6, xs: 12 }} sx={{ order: { md: 2, xs: 1 } }}>
                {imageContent}
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};
