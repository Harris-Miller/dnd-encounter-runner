import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../../routes/rootRoute';
import { useEncounterStore } from '../../store/encounter';
import { RouterLink } from '../RouterLink';

export const encounterRoute = createRoute({
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  component: EncounterPage,
  getParentRoute: () => rootRoute,
  path: '/encounter/$encounterId',
});

// eslint-disable-next-line func-style, react/function-component-definition, react-refresh/only-export-components
function EncounterPage() {
  const { encounterId } = encounterRoute.useParams();

  const encounter = useEncounterStore(state => state.encounters[encounterId]);

  if (encounter == null) {
    return <Typography>Encounter not found</Typography>;
  }

  return (
    <Card>
      <CardHeader title={`Encounter: ${encounter.name}`} />
      <CardContent>
        <Typography>
          <RouterLink to="/">Back to encounters</RouterLink>
        </Typography>
      </CardContent>
    </Card>
  );
}
