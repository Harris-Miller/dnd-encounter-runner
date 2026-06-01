import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';

export type ColorSchemeMode = 'dark' | 'light' | 'system';

type ColorSchemeContextValue = {
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
};

const STORAGE_KEY = 'dnd-encounter-runner-color-scheme';

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

const resolveSystemMode = (): 'dark' | 'light' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyModeToDocument = (mode: ColorSchemeMode): void => {
  const resolved = mode === 'system' ? resolveSystemMode() : mode;
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
};

export const ColorSchemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [colorMode, setColorMode] = useState<ColorSchemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const setMode = useCallback((next: ColorSchemeMode) => {
    setColorMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    applyModeToDocument(colorMode);
  }, [colorMode]);

  useEffect(() => {
    if (colorMode !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyModeToDocument('system');
    };
    media.addEventListener('change', handleChange);
    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, [colorMode]);

  const value = useMemo(() => ({ mode: colorMode, setMode }), [colorMode, setMode]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
};

export const useColorScheme = (): ColorSchemeContextValue => {
  const context = useContext(ColorSchemeContext);
  if (context == null) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return context;
};
