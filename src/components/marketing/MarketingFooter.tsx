import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';
import { Box, Button, Container, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import type { FC, MouseEvent } from 'react';

import { DiscordIcon } from '../DiscordIcon';

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
                <DiscordIcon fontSize="small" />
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
