import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import { mutateCreateCharacter, mutateDeleteCharacter, queryCharactersList } from '../../api/characters';
import { CharacterDeleteDialog } from '../../components/characters/CharacterDeleteDialog';
import {
  emptyCharacterFormValues,
  isCharacterFormValid,
  parseCharacterForm,
} from '../../components/characters/characterForm';
import type { CharacterFormValues } from '../../components/characters/characterForm';
import { CharacterFormFields } from '../../components/characters/CharacterFormFields';
import { queryClient } from '../../queryClient';

const formatTimestamp = (raw: string): string => {
  if (raw === '') return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString();
};

const CharactersPage: FC = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading } = useQuery(queryCharactersList);
  const createMutation = useMutation({ ...mutateCreateCharacter, mutationKey: ['characters', 'create'] });
  const deleteMutation = useMutation({ ...mutateDeleteCharacter, mutationKey: ['characters', 'delete'] });

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CharacterFormValues>(emptyCharacterFormValues);
  const [pendingDeleteId, setPendingDeleteId] = useState<null | string>(null);

  const handleCreateOpen = () => {
    setCreateForm(emptyCharacterFormValues());
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
  };

  const handleCreateConfirm = () => {
    const parsed = parseCharacterForm(createForm);
    if (parsed == null) return;

    createMutation.mutate(parsed, {
      onSuccess: created => {
        setCreateOpen(false);
        navigate({ params: { characterId: created.id }, to: '/characters/$characterId' });
      },
    });
  };

  const handleDeleteRequest = (characterId: string) => {
    setPendingDeleteId(characterId);
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

  const characters = data ?? [];
  const pendingDeleteCharacter =
    pendingDeleteId == null ? null : (characters.find(character => character.id === pendingDeleteId) ?? null);
  const createFormValid = isCharacterFormValid(createForm);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Characters</h1>
        <span className="flex-grow" />
        <button
          onClick={handleCreateOpen}
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
          type="button"
        >
          <Plus size={18} />
          New character
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: 96 }} />
          <div className="skeleton" style={{ height: 96 }} />
        </div>
      ) : null}

      {isError ? (
        <div className="alert alert-error" role="alert">
          Failed to load characters.
        </div>
      ) : null}

      {!isLoading && !isError && characters.length === 0 ? (
        <div className="alert alert-info" role="status">
          No characters yet. Click <strong>New character</strong> to add one to your roster.
        </div>
      ) : null}

      {!isLoading && !isError && characters.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {characters.map(character => (
            <article className="card-outlined" key={character.id}>
              <div style={{ alignItems: 'center', display: 'flex' }}>
                <button
                  className="card-action"
                  onClick={() => {
                    navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                  }}
                  style={{ flexGrow: 1 }}
                  type="button"
                >
                  <div className="card-content">
                    <h2 style={{ fontSize: '1.125rem', margin: '0 0 0.25rem' }}>{character.name}</h2>
                    <p className="text-secondary" style={{ margin: 0 }}>
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP · Updated {formatTimestamp(character.updatedAt)}
                    </p>
                    {character.notes != null && character.notes !== '' ? (
                      <p
                        className="text-secondary"
                        style={{
                          margin: '0.5rem 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {character.notes}
                      </p>
                    ) : null}
                  </div>
                </button>
                <div style={{ paddingRight: 8 }}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        aria-label="Delete character"
                        onClick={() => {
                          handleDeleteRequest(character.id);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        type="button"
                      >
                        <Trash2 color="var(--color-error)" size={20} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                        Delete character
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </div>
            </article>
          ))}
        </div>
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
            <Dialog.Title>New character</Dialog.Title>
            <div style={{ paddingTop: 8 }}>
              <CharacterFormFields disabled={createMutation.isPending} onChange={setCreateForm} values={createForm} />
            </div>
            <div className="dialog-actions">
              <button onClick={handleCreateClose} type="button">
                Cancel
              </button>
              <button
                disabled={!createFormValid || createMutation.isPending}
                onClick={handleCreateConfirm}
                type="button"
              >
                Create
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <CharacterDeleteDialog
        characterName={pendingDeleteCharacter?.name ?? null}
        isPending={deleteMutation.isPending}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        open={pendingDeleteId !== null}
      />
    </div>
  );
};

export const Route = createFileRoute('/characters/')({
  component: CharactersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCharactersList);
  },
});
