import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateEncounter, mutateDeleteEncounter } from '../../../api/encounters';
import type { EncounterListItem } from '../../../api/encounters';

import { EncounterCards } from './EncounterCards';

export interface EncounterListSectionProps {
  campaignId: string;
  encounters: EncounterListItem[];
  isError: boolean;
  isLoading: boolean;
  isOwner?: boolean;
  showHeading?: boolean;
}

export const EncounterListSection: FC<EncounterListSectionProps> = ({
  campaignId,
  encounters,
  isError,
  isLoading,
  isOwner = true,
  showHeading = true,
}) => {
  const navigate = useNavigate();
  const createMutation = useMutation({
    ...mutateCreateEncounter(campaignId),
    mutationKey: ['encounters', 'create', campaignId],
  });
  const deleteMutation = useMutation({ ...mutateDeleteEncounter, mutationKey: ['encounters', 'delete', campaignId] });

  const [createDraft, setCreateDraft] = useState<null | string>(null);
  const createOpen = createDraft !== null;

  const [pendingDeleteId, setPendingDeleteId] = useState<null | string>(null);

  const handleCreateOpen = () => {
    setCreateDraft('');
  };

  const handleCreateClose = () => {
    setCreateDraft(null);
  };

  const handleCreateConfirm = () => {
    const name = (createDraft ?? '').trim();
    const finalName = name === '' ? 'Untitled Encounter' : name;

    createMutation.mutate(
      { name: finalName },
      {
        onSuccess: created => {
          setCreateDraft(null);
          navigate({ params: { encounterId: created.id }, to: '/encounter/$encounterId' });
        },
      },
    );
  };

  const handleDeleteRequest = (encounterId: string) => {
    setPendingDeleteId(encounterId);
  };

  const handleDeleteCancel = () => {
    setPendingDeleteId(null);
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId == null) return;
    const idToDelete = pendingDeleteId;
    deleteMutation.mutate(idToDelete, {
      onSettled: () => {
        setPendingDeleteId(null);
      },
    });
  };

  const pendingDeleteEncounter =
    pendingDeleteId == null ? null : (encounters.find(encounter => encounter.id === pendingDeleteId) ?? null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {showHeading ? (
        <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Encounters</h2>
          <span className="flex-grow" />
          {isOwner ? (
            <button
              onClick={handleCreateOpen}
              style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
              type="button"
            >
              <Plus size={18} />
              New encounter
            </button>
          ) : null}
        </div>
      ) : isOwner ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCreateOpen}
            style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
            type="button"
          >
            <Plus size={18} />
            New encounter
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 96 }} />
          <div className="skeleton" style={{ height: 96 }} />
        </div>
      ) : null}

      {isError ? (
        <div className="alert alert-error" role="alert">
          Failed to load encounters.
        </div>
      ) : null}

      {!isLoading && !isError && encounters.length === 0 ? (
        <div className="alert alert-info" role="status">
          {isOwner ? (
            <>
              No encounters yet. Click <strong>New encounter</strong> to get started.
            </>
          ) : (
            'No encounters in this campaign yet.'
          )}
        </div>
      ) : null}

      {!isLoading && !isError && encounters.length > 0 ? (
        <EncounterCards
          encounters={encounters}
          onDeleteRequest={isOwner ? handleDeleteRequest : undefined}
          onSelectEncounter={encounterId => {
            navigate({ params: { encounterId }, to: '/encounter/$encounterId' });
          }}
        />
      ) : null}

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleCreateClose();
          }
        }}
        open={createOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>New encounter</Dialog.Title>
            <div className="field" style={{ paddingTop: 8 }}>
              <Label.Root className="field-label" htmlFor="encounter-create-name">
                Encounter name
              </Label.Root>
              <input
                className="field-input"
                id="encounter-create-name"
                onChange={event => {
                  setCreateDraft(event.target.value);
                }}
                placeholder="Untitled Encounter"
                value={createDraft ?? ''}
              />
            </div>
            <div className="dialog-actions">
              <button onClick={handleCreateClose} type="button">
                Cancel
              </button>
              <button disabled={createMutation.isPending} onClick={handleCreateConfirm} type="button">
                Create
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleDeleteCancel();
          }
        }}
        open={pendingDeleteId !== null}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Delete encounter</Dialog.Title>
            <p style={{ margin: '1rem 0' }}>
              Delete <strong>{pendingDeleteEncounter?.name ?? 'this encounter'}</strong>? This cannot be undone.
            </p>
            <div className="dialog-actions">
              <button onClick={handleDeleteCancel} type="button">
                Cancel
              </button>
              <button disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} type="button">
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
