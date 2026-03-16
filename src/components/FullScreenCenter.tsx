import { Box } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

export const FullScreenCenter: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      width: '100%',
    }}
  >
    {children}
  </Box>
);
