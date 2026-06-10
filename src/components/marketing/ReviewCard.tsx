import { Avatar, Box, Stack, Typography } from '@mui/material';
import type { FC } from 'react';

import type { DisplayedReview } from '../../utils/pickLandingReviews';

interface ReviewCardProps {
  review: DisplayedReview;
}

export const ReviewCard: FC<ReviewCardProps> = ({ review }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      height: '100%',
      p: 2,
    }}
  >
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar alt={review.name} src={review.avatarSrc} sx={{ height: 40, width: 40 }} />
        <Stack spacing={0.25}>
          <Typography sx={{ fontWeight: 700 }} variant="body2">
            {review.name}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {review.handle}
          </Typography>
        </Stack>
      </Stack>
      <Typography variant="body2">{review.text}</Typography>
    </Stack>
  </Box>
);
