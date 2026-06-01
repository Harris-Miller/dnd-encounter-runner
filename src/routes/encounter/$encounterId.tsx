import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import {
  mutateSetEncounterActive,
  mutateSetEncounterName,
  queryEncounter,
  useApplyTransform,
} from '../../api/encounters';
import { AddCombatantDialog } from '../../components/encounter/AddCombatantDialog';
import { ApplyEffectDialog } from '../../components/encounter/ApplyEffectDialog';
import { CombatantDetailDrawer } from '../../components/encounter/CombatantDetailDrawer';
import { InitiativeTracker } from '../../components/encounter/InitiativeTracker';
import { RecordEventToolbar } from '../../components/encounter/RecordEventToolbar';
import { ReminderPanel } from '../../components/encounter/ReminderPanel';
import { RouterLink } from '../../components/RouterLink';
import { Alert } from '../../components/ui/Alert';
import { Box } from '../../components/ui/Box';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../../components/ui/Dialog';
import { IconButton } from '../../components/ui/IconButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { Stack } from '../../components/ui/Stack';
import { TextField } from '../../components/ui/TextField';
import { Typography } from '../../components/ui/Typography';
import { queryClient } from '../../queryClient';
import { fetchQueryOrNotFound } from '../../utils/fetchQueryOrNotFound';

const routeApi = getRouteApi('/encounter/$encounterId');

const EncounterPage: FC = () => {
  const { encounterId } = routeApi.useParams();
  const { data, isError, isLoading } = useQuery(queryEncounter(encounterId));
  const setNameMutation = useMutation({
    ...mutateSetEncounterName,
    mutationKey: ['encounter', encounterId, 'set-name'],
  });
  const setActiveMutation = useMutation({
    ...mutateSetEncounterActive,
    mutationKey: ['encounter', encounterId, 'set-active'],
  });
  const [renameDraft, setRenameDraft] = useState<null | string>(null);
  const renameOpen = renameDraft !== null;
  const [selectedCombatantId, setSelectedCombatantId] = useState<null | string>(null);
  const [addCombatantOpen, setAddCombatantOpen] = useState(false);
  const [applyEffectForCombatantId, setApplyEffectForCombatantId] = useState<null | string>(null);
  const applyTransform = useApplyTransform(encounterId);

  const handleAdvanceTurn = () => {
    applyTransform.mutate({
      input: { buildId: () => crypto.randomUUID(), now: new Date().toISOString() },
      type: 'advanceTurn',
    });
  };

  const handleAdvanceRound = () => {
    applyTransform.mutate({
      input: { buildId: () => crypto.randomUUID(), now: new Date().toISOString() },
      type: 'advanceRound',
    });
  };

  const handleRecordEvent = (
    event: Parameters<typeof applyTransform.mutate>[0]['input'] extends infer T
      ? T extends { event: infer E }
        ? E
        : never
      : never,
  ) => {
    applyTransform.mutate({
      input: { buildId: () => crypto.randomUUID(), event, now: new Date().toISOString() },
      type: 'recordEvent',
    });
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={48} variant="rectangular" />
        <Skeleton height={240} variant="rectangular" />
      </Stack>
    );
  }

  if (isError || data == null) {
    return <Alert severity="error">Encounter not found.</Alert>;
  }

  const handleRenameOpen = () => {
    setRenameDraft(data.name);
  };

  const handleRenameClose = () => {
    setRenameDraft(null);
  };

  const handleRenameConfirm = () => {
    if (renameDraft == null) {
      return;
    }
    const next = renameDraft.trim();

    if (next === '' || next === data.name) {
      setRenameDraft(null);
      return;
    }

    setNameMutation.mutate({ encounterId, name: next });
    setRenameDraft(null);
  };

  const handleToggleActive = () => {
    setActiveMutation.mutate({ active: !data.active, encounterId });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography style={{ marginBottom: 8 }} variant="body2">
          <RouterLink to="/encounter">Back to encounters</RouterLink>
        </Typography>
        <Box style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Typography variant="h4">{data.name}</Typography>
          <IconButton onClick={handleRenameOpen}>
            <Pencil />
          </IconButton>
          <Chip
            color={data.active ? 'success' : 'default'}
            label={data.active ? 'Active' : 'Inactive'}
            onClick={handleToggleActive}
          />
          <Box style={{ flexGrow: 1 }} />
          <Typography style={{ color: 'var(--color-text-secondary)' }} variant="body2">
            Round {String(data.state.round)} · Turn {String(data.state.turnIndex + 1)} of{' '}
            {String(data.state.initiativeOrder.length)}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Button
          onClick={() => {
            setAddCombatantOpen(true);
          }}
          startIcon={<Plus />}
          variant="outlined"
        >
          Add combatant
        </Button>
      </Box>

      <InitiativeTracker
        isAdvancing={applyTransform.isPending}
        onAdvanceTurn={handleAdvanceTurn}
        onSelectCombatant={setSelectedCombatantId}
        selectedCombatantId={selectedCombatantId}
        state={data.state}
      />

      <RecordEventToolbar onAdvanceRound={handleAdvanceRound} onRecordEvent={handleRecordEvent} state={data.state} />

      <ReminderPanel
        onDismissReminder={reminderId => {
          applyTransform.mutate({ input: { reminderId }, type: 'dismissReminder' });
        }}
        state={data.state}
      />

      <AddCombatantDialog
        buildId={() => crypto.randomUUID()}
        existingCombatantIds={new Set(Object.keys(data.state.combatants))}
        onClose={() => {
          setAddCombatantOpen(false);
        }}
        onConfirm={combatant => {
          applyTransform.mutate({ input: { combatant }, type: 'addCombatant' });
          setAddCombatantOpen(false);
        }}
        open={addCombatantOpen}
      />

      <ApplyEffectDialog
        buildId={() => crypto.randomUUID()}
        combatantName={
          applyEffectForCombatantId == null ? '' : (data.state.combatants[applyEffectForCombatantId]?.name ?? '')
        }
        onClose={() => {
          setApplyEffectForCombatantId(null);
        }}
        onConfirm={effect => {
          if (applyEffectForCombatantId == null) return;
          applyTransform.mutate({
            input: { combatantId: applyEffectForCombatantId, effect },
            type: 'applyEffect',
          });
          setApplyEffectForCombatantId(null);
        }}
        open={applyEffectForCombatantId !== null}
      />

      <CombatantDetailDrawer
        combatant={selectedCombatantId == null ? null : (data.state.combatants[selectedCombatantId] ?? null)}
        onAdjustHp={(combatantId, delta) => {
          applyTransform.mutate({ input: { combatantId, delta }, type: 'adjustHp' });
        }}
        onApplyEffect={combatantId => {
          setApplyEffectForCombatantId(combatantId);
        }}
        onClose={() => {
          setSelectedCombatantId(null);
        }}
        onMarkReactionUsed={(combatantId, used) => {
          applyTransform.mutate({ input: { combatantId, used }, type: 'markReactionUsed' });
        }}
        onRemoveCombatant={combatantId => {
          applyTransform.mutate({ input: { combatantId }, type: 'removeCombatant' });
        }}
        onRemoveEffect={(combatantId, effectId) => {
          applyTransform.mutate({ input: { combatantId, effectId }, type: 'removeEffect' });
        }}
        onSetInitiative={(combatantId, initiative) => {
          applyTransform.mutate({ input: { combatantId, initiative }, type: 'setInitiative' });
        }}
      />

      <Dialog maxWidth="sm" onClose={handleRenameClose} open={renameOpen}>
        <DialogTitle>Rename Encounter</DialogTitle>
        <DialogContent>
          <Box style={{ paddingTop: 8 }}>
            <TextField
              label="Encounter name"
              onChange={event => {
                setRenameDraft(event.target.value);
              }}
              value={renameDraft ?? ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const Route = createFileRoute('/encounter/$encounterId')({
  component: EncounterPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryEncounter(params.encounterId));
  },
});
