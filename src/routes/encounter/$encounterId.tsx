import { Box, Button, Callout, Dialog, Flex, Heading, IconButton, Skeleton, Text, TextField } from '@radix-ui/themes';
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
      <Flex direction="column" gap="4">
        <Skeleton height="48px" />
        <Skeleton height="240px" />
      </Flex>
    );
  }

  if (isError || data == null) {
    return (
      <Callout.Root color="red" role="alert">
        <Callout.Text>Encounter not found.</Callout.Text>
      </Callout.Root>
    );
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
    <Flex direction="column" gap="5">
      <Box>
        <Text as="p" mb="2">
          <RouterLink to="/encounter">Back to encounters</RouterLink>
        </Text>
        <Flex align="center" gap="4" wrap="wrap">
          <Heading size="6">{data.name}</Heading>
          <IconButton aria-label="Rename encounter" onClick={handleRenameOpen} type="button" variant="ghost">
            <Pencil size={20} />
          </IconButton>
          <Button color={data.active ? 'green' : 'gray'} onClick={handleToggleActive} type="button" variant="soft">
            {data.active ? 'Active' : 'Inactive'}
          </Button>
          <Box flexGrow="1" />
          <Text color="gray" size="2">
            Round {String(data.state.round)} · Turn {String(data.state.turnIndex + 1)} of{' '}
            {String(data.state.initiativeOrder.length)}
          </Text>
        </Flex>
      </Box>

      <Box>
        <Button
          onClick={() => {
            setAddCombatantOpen(true);
          }}
          type="button"
        >
          <Plus size={18} />
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

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleRenameClose();
          }
        }}
        open={renameOpen}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Rename Encounter</Dialog.Title>
          <Flex direction="column" gap="1" mt="4">
            <Text as="label" htmlFor="encounter-rename" size="2" weight="medium">
              Encounter name
            </Text>
            <TextField.Root
              id="encounter-rename"
              onChange={event => {
                setRenameDraft(event.target.value);
              }}
              value={renameDraft ?? ''}
            />
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleRenameClose} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleRenameConfirm} type="button">
              Save
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};

export const Route = createFileRoute('/encounter/$encounterId')({
  component: EncounterPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryEncounter(params.encounterId));
  },
});
