import { Box, Typography } from '@mui/material';
import type { FC } from 'react';

interface PlaceholderImageProps {
  label?: string;
}

export const PlaceholderImage: FC<PlaceholderImageProps> = ({ label = 'Screenshot placeholder' }) => (
  <Box
    sx={{
      alignItems: 'center',
      aspectRatio: '16 / 9',
      bgcolor: 'action.hover',
      borderRadius: 2,
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    }}
  >
    <Typography color="text.secondary" variant="body2">
      {label}
    </Typography>
  </Box>
);
