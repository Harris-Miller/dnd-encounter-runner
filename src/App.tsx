import { Theme } from '@radix-ui/themes';
import type { FC } from 'react';

import { ColorSchemeProvider, useColorScheme } from './providers/ColorSchemeProvider';
import { Router } from './router';
import '@radix-ui/themes/styles.css';
import './styles/global.css';

const ThemedApp: FC = () => {
  const { appearance } = useColorScheme();

  return (
    <Theme accentColor="ruby" appearance={appearance}>
      <Router />
    </Theme>
  );
};

export const App: FC = () => (
  <ColorSchemeProvider>
    <ThemedApp />
  </ColorSchemeProvider>
);
