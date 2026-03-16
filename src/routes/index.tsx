import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Container, Paper, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

// import dndLogo from '../assets/dnd-logo.svg';
import { FullScreenCenter } from '../components/FullScreenCenter';

// const Img = styled('img')();

const IndexComponent: FC = () => {
  // const navigate = useNavigate();
  // const user = useStore(state => state.user);

  // TODO: this nav should happen not in the index page, but in the pre-loader
  // if (user != null) {
  //   navigate({ to: '/rooms' });
  //   return null;
  // }

  return (
    <FullScreenCenter>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <Typography sx={{ alignItems: 'center', display: 'flex', marginBottom: '24px' }} variant="h3">
            {/* <Img alt="D&D Logo" src={dndLogo} sx={{ color: 'red', height: '1.5em', marginX: '12px', width: '1.5em' }} />{' '} */}
            DnD Encounter Runner
          </Typography>
          <Typography sx={{ marginBottom: '24px' }} variant="h5">
            Sign In
          </Typography>
          <Button
            startIcon={<GoogleIcon />}
            sx={{ '&:hover': { cursor: 'not-allowed' }, marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Google
          </Button>
          <Button
            startIcon={<FacebookIcon />}
            sx={{ '&:hover': { cursor: 'not-allowed' }, marginBottom: '12px', width: '100%' }}
            variant="outlined"
          >
            Facebook
          </Button>
          {/* <Box sx={{ marginBottom: '12px' }}>
            <Typography>Or</Typography>
          </Box> */}
          {/* <SignUp /> */}
        </Paper>
      </Container>
    </FullScreenCenter>
  );
};

export const Route = createFileRoute('/')({
  component: IndexComponent,
});
