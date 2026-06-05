import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import { Box, Button, Container, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import type { FC, MouseEvent } from 'react';

const DiscordIcon: FC = () => (
  <svg fill="currentColor" height="24" viewBox="0 0 127.14 96.36" width="24">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c1-.73,2-1.51,3-2.31a74.12,74.12,0,0,0,91.59,0c1,.8,2,1.58,3,2.31a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,48.12,123.7,25.33,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

interface FooterLinkGroup {
  links: readonly { label: string }[];
  title: string;
}

const FOOTER_LINK_GROUPS: readonly FooterLinkGroup[] = [
  {
    links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'Changelog' }],
    title: 'Product',
  },
  {
    links: [{ label: 'Documentation' }, { label: 'Contact' }, { label: 'FAQ' }],
    title: 'Support',
  },
  {
    links: [{ label: 'About' }, { label: 'Blog' }, { label: 'Privacy' }],
    title: 'Company',
  },
];

const preventNavigation = (event: MouseEvent) => {
  event.preventDefault();
};

export const MarketingFooter: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderColor: 'divider',
        borderTop: 1,
        mt: 8,
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {FOOTER_LINK_GROUPS.map(group => (
            <Grid key={group.title} size={{ md: 3, sm: 4, xs: 6 }}>
              <Typography sx={{ fontWeight: 600, mb: 1.5 }} variant="subtitle2">
                {group.title}
              </Typography>
              <Stack spacing={1}>
                {group.links.map(link => (
                  <Button
                    color="inherit"
                    key={link.label}
                    onClick={preventNavigation}
                    sx={{
                      color: 'text.secondary',
                      justifyContent: 'flex-start',
                      minWidth: 0,
                      p: 0,
                      textTransform: 'none',
                      typography: 'body2',
                    }}
                    variant="text"
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </Grid>
          ))}
          <Grid size={{ md: 3, sm: 4, xs: 6 }}>
            <Typography sx={{ fontWeight: 600, mb: 1.5 }} variant="subtitle2">
              Connect
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="GitHub" color="inherit" onClick={preventNavigation} size="small">
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton aria-label="Discord" color="inherit" onClick={preventNavigation} size="small">
                <DiscordIcon />
              </IconButton>
              <IconButton aria-label="X" color="inherit" onClick={preventNavigation} size="small">
                <XIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography color="text.secondary" variant="body2">
          &copy; {currentYear} D&D Encounter Runner. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
