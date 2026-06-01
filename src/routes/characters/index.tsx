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
import { Alert } from '../../components/ui/Alert';
import { Box } from '../../components/ui/Box';
import { Button } from '../../components/ui/Button';
import { Card, CardActionArea, CardContent } from '../../components/ui/Card';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../../components/ui/Dialog';
import { IconButton } from '../../components/ui/IconButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { Stack } from '../../components/ui/Stack';
import { Tooltip } from '../../components/ui/Tooltip';
import { Typography } from '../../components/ui/Typography';
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
    <Stack spacing={3}>
      <Box style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <Typography variant="h4">Characters</Typography>
        <span className="flex-grow" />
        <Button onClick={handleCreateOpen} startIcon={<Plus size={18} />} type="button" variant="contained">
          New character
        </Button>
      </Box>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton height={96} variant="rectangular" />
          <Skeleton height={96} variant="rectangular" />
        </Stack>
      ) : null}

      {isError ? <Alert severity="error">Failed to load characters.</Alert> : null}

      {!isLoading && !isError && characters.length === 0 && (
        <Alert severity="info">
          No characters yet. Click <strong>New character</strong> to add one to your roster.
        </Alert>
      )}

      {!isLoading && !isError && characters.length > 0 && (
        <Stack spacing={2}>
          {characters.map(character => (
            <Card key={character.id} variant="outlined">
              <Box style={{ alignItems: 'center', display: 'flex' }}>
                <CardActionArea
                  onClick={() => {
                    navigate({ params: { characterId: character.id }, to: '/characters/$characterId' });
                  }}
                  style={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Typography variant="h6">{character.name}</Typography>
                    <Typography className="text-secondary" variant="body2">
                      Level {String(character.level)} · AC {String(character.armorClass)} ·{' '}
                      {String(character.maxHitPoints)} HP · Updated {formatTimestamp(character.updatedAt)}
                    </Typography>
                    {character.notes != null && character.notes !== '' && (
                      <Typography
                        className="text-secondary"
                        style={{ marginTop: 32, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        variant="body2"
                      >
                        {character.notes}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
                <Box style={{ paddingRight: 8 }}>
                  <Tooltip title="Delete character">
                    <IconButton
                      aria-label="Delete character"
                      onClick={() => {
                        handleDeleteRequest(character.id);
                      }}
                      type="button"
                    >
                      <Trash2 color="var(--color-error)" size={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog maxWidth="sm" onClose={handleCreateClose} open={createOpen}>
        <DialogTitle>New character</DialogTitle>
        <DialogContent>
          <Box style={{ paddingTop: 8 }}>
            <CharacterFormFields disabled={createMutation.isPending} onChange={setCreateForm} values={createForm} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} type="button">
            Cancel
          </Button>
          <Button
            disabled={!createFormValid || createMutation.isPending}
            onClick={handleCreateConfirm}
            type="button"
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <CharacterDeleteDialog
        characterName={pendingDeleteCharacter?.name ?? null}
        isPending={deleteMutation.isPending}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        open={pendingDeleteId !== null}
      />
    </Stack>
  );
};

export const Route = createFileRoute('/characters/')({
  component: CharactersPage,
  loader: async () => {
    await queryClient.ensureQueryData(queryCharactersList);
  },
});
