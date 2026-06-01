import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import type { Character } from '../../api/characters';
import { mutateDeleteCharacter, mutateUpdateCharacter, queryCharacter } from '../../api/characters';
import { CharacterDeleteDialog } from '../../components/characters/CharacterDeleteDialog';
import {
  characterToFormValues,
  isCharacterFormValid,
  parseCharacterForm,
} from '../../components/characters/characterForm';
import type { CharacterFormValues } from '../../components/characters/characterForm';
import { CharacterFormFields } from '../../components/characters/CharacterFormFields';
import { Alert } from '../../components/compat/Alert';
import { Box } from '../../components/compat/Box';
import { Button } from '../../components/compat/Button';
import { Skeleton } from '../../components/compat/Skeleton';
import { Stack } from '../../components/compat/Stack';
import { Typography } from '../../components/compat/Typography';
import { RouterLink } from '../../components/RouterLink';
import { queryClient } from '../../queryClient';
import { fetchQueryOrNotFound } from '../../utils/fetchQueryOrNotFound';

const routeApi = getRouteApi('/characters/$characterId');

interface CharacterEditFormProps {
  character: Character;
  characterId: string;
}

const CharacterEditForm: FC<CharacterEditFormProps> = ({ character, characterId }) => {
  const [form, setForm] = useState<CharacterFormValues>(() => characterToFormValues(character));
  const updateMutation = useMutation({
    ...mutateUpdateCharacter,
    mutationKey: ['characters', characterId, 'update'],
  });

  const handleSave = () => {
    const parsed = parseCharacterForm(form);
    if (parsed == null) return;

    updateMutation.mutate({
      armorClass: parsed.armorClass,
      id: characterId,
      level: parsed.level,
      maxHitPoints: parsed.maxHitPoints,
      name: parsed.name,
      notes: parsed.notes,
    });
  };

  const formValid = isCharacterFormValid(form);
  const isDirty =
    form.name !== character.name ||
    form.level !== String(character.level) ||
    form.armorClass !== String(character.armorClass) ||
    form.maxHitPoints !== String(character.maxHitPoints) ||
    form.notes !== (character.notes ?? '');

  return (
    <>
      <Typography variant="h4">{character.name}</Typography>

      <CharacterFormFields disabled={updateMutation.isPending} onChange={setForm} values={form} />

      <Box style={{ display: 'flex', gap: 16 }}>
        <Button disabled={!formValid || !isDirty || updateMutation.isPending} onClick={handleSave} variant="contained">
          Save changes
        </Button>
        {updateMutation.isError ? <Alert severity="error">Failed to save character.</Alert> : null}
      </Box>
    </>
  );
};

const CharacterDetailPage: FC = () => {
  const { characterId } = routeApi.useParams();
  const navigate = useNavigate();
  const { data, isError, isLoading } = useQuery(queryCharacter(characterId));
  const deleteMutation = useMutation({
    ...mutateDeleteCharacter,
    mutationKey: ['characters', characterId, 'delete'],
  });

  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(characterId, {
      onSuccess: () => {
        navigate({ to: '/characters' });
      },
    });
  };

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton height={40} style={{ maxWidth: 200 }} variant="rectangular" />
        <Skeleton height={320} variant="rectangular" />
      </Stack>
    );
  }

  if (isError || data == null) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">Character not found or failed to load.</Alert>
        <Button asChild variant="outlined">
          <RouterLink to="/characters">Back to characters</RouterLink>
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <Button asChild variant="text">
          <RouterLink to="/characters">
            <ArrowLeft size={18} /> Characters
          </RouterLink>
        </Button>
        <Box style={{ flexGrow: 1 }} />
        <Button
          onClick={() => {
            setDeleteOpen(true);
          }}
          startIcon={<Trash2 />}
          variant="outlined"
        >
          Delete
        </Button>
      </Box>

      <CharacterEditForm character={data} characterId={characterId} key={`${data.id}-${data.updatedAt}`} />

      <CharacterDeleteDialog
        characterName={data.name}
        isPending={deleteMutation.isPending}
        onCancel={() => {
          setDeleteOpen(false);
        }}
        onConfirm={handleDeleteConfirm}
        open={deleteOpen}
      />
    </Stack>
  );
};

export const Route = createFileRoute('/characters/$characterId')({
  component: CharacterDetailPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryCharacter(params.characterId));
  },
});
