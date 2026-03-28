import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { AppBar, Avatar, Box, ButtonGroup, IconButton, Popover, Toolbar, Tooltip, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { FC, MouseEvent } from 'react';
import { match } from 'ts-pattern';

import { queryUser } from '../api/user';

export const Header: FC = () => {
  const { mode, setMode } = useColorScheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const user = useQuery(queryUser);

  const avatarUrl = user.data?.user_metadata.avatar_url as string | undefined;

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
          <Box sx={{ flexGrow: 1 }}>
            <Typography component="h1" sx={{ flexGrow: 1 }} variant="h6">
              D&D Encounter Runner
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
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
            <Tooltip title="Open settings">
              <IconButton sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src={avatarUrl} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};
