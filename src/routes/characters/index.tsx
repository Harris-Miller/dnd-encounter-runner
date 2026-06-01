import {
  Box,
  Button,
  Callout,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  Text,
  Tooltip,
} from '@radix-ui/themes';
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
    <Flex direction="column" gap="5">
      <Flex align="center" gap="4">
        <Heading size="6">Characters</Heading>
        <Box flexGrow="1" />
        <Button onClick={handleCreateOpen} type="button">
          <Plus size={18} />
          New character
        </Button>
      </Flex>

      {isLoading ? (
        <Flex direction="column" gap="4">
          <Skeleton height="96px" />
          <Skeleton height="96px" />
        </Flex>
      ) : null}

      {isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>Failed to load characters.</Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && characters.length === 0 ? (
        <Callout.Root color="blue" role="status">
          <Callout.Text>
            No characters yet. Click <strong>New character</strong> to add one to your roster.
          </Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && characters.length > 0 ? (
        <Flex direction="column" gap="4">
          {characters.map(character => (
            <Card key={character.id} variant="surface">
              <Flex align="center">
                <button
                  onClick={() => {
                    navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    flexGrow: 1,
                    font: 'inherit',
                    padding: 'var(--space-4)',
                    textAlign: 'left',
                  }}
                  type="button"
                >
                  <Heading mb="1" size="4">
                    {character.name}
                  </Heading>
                  <Text color="gray" size="2">
                    Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                    {String(character.maxHitPoints)} HP · Updated {formatTimestamp(character.updatedAt)}
                  </Text>
                  {character.notes != null && character.notes !== '' ? (
                    <Text
                      color="gray"
                      size="2"
                      style={{
                        display: 'block',
                        marginTop: 'var(--space-2)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {character.notes}
                    </Text>
                  ) : null}
                </button>
                <Box pr="2">
                  <Tooltip content="Delete character">
                    <IconButton
                      aria-label="Delete character"
                      color="red"
                      onClick={() => {
                        handleDeleteRequest(character.id);
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Flex>
            </Card>
          ))}
        </Flex>
      ) : null}

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleCreateClose();
          }
        }}
        open={createOpen}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>New character</Dialog.Title>
          <Box pt="2">
            <CharacterFormFields disabled={createMutation.isPending} onChange={setCreateForm} values={createForm} />
          </Box>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleCreateClose} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={!createFormValid || createMutation.isPending} onClick={handleCreateConfirm} type="button">
              Create
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <CharacterDeleteDialog
        characterName={pendingDeleteCharacter?.name ?? null}
        isPending={deleteMutation.isPending}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        open={pendingDeleteId !== null}
      />
    </Flex>
  );
};

export const Route = createFileRoute('/characters/')({
  component: CharactersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCharactersList);
  },
});
