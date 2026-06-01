import type { FC } from 'react';

import { ColorSchemeProvider } from './components/ui/ColorSchemeProvider';
import { TooltipProvider } from './components/ui/Tooltip';
import { Router } from './router';
import './styles/global.css';

export const App: FC = () => {
  return (
    <ColorSchemeProvider>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </ColorSchemeProvider>
  );
};
