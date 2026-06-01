import * as Tooltip from '@radix-ui/react-tooltip';
import type { FC } from 'react';

import { ColorSchemeProvider } from './providers/ColorSchemeProvider';
import { Router } from './router';
import './styles/global.css';
import './styles/radix.css';

export const App: FC = () => {
  return (
    <ColorSchemeProvider>
      <Tooltip.Provider>
        <Router />
      </Tooltip.Provider>
    </ColorSchemeProvider>
  );
};
