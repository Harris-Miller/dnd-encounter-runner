import { Box } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

import { MarketingFooter } from './MarketingFooter';
import { PublicHeader } from './PublicHeader';

export const MarketingLayout: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
    <PublicHeader />
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
    <MarketingFooter />
  </Box>
);
