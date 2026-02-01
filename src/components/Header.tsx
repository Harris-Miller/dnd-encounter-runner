import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography component="h1" sx={{ flexGrow: 1 }} variant="h6">
            D&D Encounter Runner
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};
