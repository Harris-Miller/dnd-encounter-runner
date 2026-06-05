import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { ButtonGroup, IconButton, Popover } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { match } from 'ts-pattern';

export const ThemeModeMenu: FC = () => {
  const { mode, setMode } = useColorScheme();
  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleThemeOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleThemeClose = () => {
    setThemeAnchorEl(null);
  };

  const themeOpen = Boolean(themeAnchorEl);

  return (
    <>
      <IconButton color="inherit" onClick={handleThemeOpen}>
        {match(mode!)
          .with('light', () => <LightModeIcon />)
          .with('system', () => <SettingsBrightnessIcon />)
          .with('dark', () => <DarkModeIcon />)
          .exhaustive()}
      </IconButton>
      <Popover
        anchorEl={themeAnchorEl}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        onClose={handleThemeClose}
        open={themeOpen}
        transformOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
      >
        <ButtonGroup aria-label="Theme mode" variant="contained">
          <IconButton
            onClick={() => {
              setMode('light');
            }}
          >
            <LightModeIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setMode('system');
            }}
          >
            <SettingsBrightnessIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setMode('dark');
            }}
          >
            <DarkModeIcon />
          </IconButton>
        </ButtonGroup>
      </Popover>
    </>
  );
};
