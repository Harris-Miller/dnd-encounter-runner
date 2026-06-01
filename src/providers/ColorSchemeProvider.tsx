import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';

export type ColorSchemeMode = 'dark' | 'light' | 'system';
export type ResolvedAppearance = 'dark' | 'light';

type ColorSchemeContextValue = {
  appearance: ResolvedAppearance;
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
};

const STORAGE_KEY = 'dnd-encounter-runner-color-scheme';

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

const resolveSystemMode = (): ResolvedAppearance =>
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

  const [systemAppearance, setSystemAppearance] = useState<ResolvedAppearance>(() => resolveSystemMode());

  const appearance = useMemo(
    () => (colorMode === 'system' ? systemAppearance : colorMode),
    [colorMode, systemAppearance],
  );

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
      setSystemAppearance(resolveSystemMode());
      applyModeToDocument('system');
    };
    media.addEventListener('change', handleChange);
    return () => {
      media.removeEventListener('change', handleChange);
    };
  }, [colorMode]);

  const value = useMemo(() => ({ appearance, mode: colorMode, setMode }), [appearance, colorMode, setMode]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
};

export const useColorScheme = (): ColorSchemeContextValue => {
  const context = useContext(ColorSchemeContext);
  if (context == null) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return context;
};
