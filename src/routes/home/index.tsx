import { Container, Paper, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

// import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../../components/FullScreenCenter';

// const Img = styled('img')();

const HomeComponent: FC = () => {
  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
            {/* <Img alt="D&D Logo" src={dndLogo} sx={{ color: 'red', height: '1.5em', marginX: '12px', width: '1.5em' }} />{' '} */}
            DnD Encounter Runner
          </Typography>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h4">
            Home Page
          </Typography>
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/home/')({
  component: HomeComponent,
});
