import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="skeleton" style={{ height: 48 }} />
        <div className="skeleton" style={{ height: 240 }} />
      </div>
    );
  }

  if (isError || data == null) {
    return (
      <div className="alert alert-error" role="alert">
        Encounter not found.
      </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem' }}>
          <RouterLink to="/encounter">Back to encounters</RouterLink>
        </p>
        <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{data.name}</h1>
          <button
            aria-label="Rename encounter"
            onClick={handleRenameOpen}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            type="button"
          >
            <Pencil size={20} />
          </button>
          <button
            className={data.active ? 'chip chip-success' : 'chip chip-default'}
            onClick={handleToggleActive}
            style={{ border: 'none', cursor: 'pointer' }}
            type="button"
          >
            {data.active ? 'Active' : 'Inactive'}
          </button>
          <span className="flex-grow" />
          <p className="text-secondary" style={{ margin: 0 }}>
            Round {String(data.state.round)} · Turn {String(data.state.turnIndex + 1)} of{' '}
            {String(data.state.initiativeOrder.length)}
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={() => {
            setAddCombatantOpen(true);
          }}
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
          type="button"
        >
          <Plus size={18} />
          Add combatant
        </button>
      </div>

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
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Rename Encounter</Dialog.Title>
            <div className="field" style={{ paddingTop: 8 }}>
              <Label.Root className="field-label" htmlFor="encounter-rename">
                Encounter name
              </Label.Root>
              <input
                className="field-input"
                id="encounter-rename"
                onChange={event => {
                  setRenameDraft(event.target.value);
                }}
                value={renameDraft ?? ''}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={handleRenameClose} type="button">
                Cancel
              </button>
              <button onClick={handleRenameConfirm} type="button">
                Save
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export const Route = createFileRoute('/encounter/$encounterId')({
  component: EncounterPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryEncounter(params.encounterId));
  },
});
