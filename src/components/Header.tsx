import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { AppBar, ButtonGroup, IconButton, Popover, Toolbar, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { match } from 'ts-pattern';

export const Header: FC = () => {
  const { mode, setMode } = useColorScheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography component="h1" sx={{ flexGrow: 1 }} variant="h6">
            D&D Encounter Runner
          </Typography>
          <IconButton color="inherit" onClick={handleClick}>
            {match(mode!)
              .with('light', () => <LightModeIcon />)
              .with('system', () => <SettingsBrightnessIcon />)
              .with('dark', () => <DarkModeIcon />)
              .exhaustive()}
          </IconButton>
          <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
              horizontal: 'center',
              vertical: 'bottom',
            }}
            onClose={handleClose}
            open={open}
            transformOrigin={{
              horizontal: 'center',
              vertical: 'top',
            }}
          >
            <ButtonGroup aria-label="Basic button group" variant="contained">
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
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};
