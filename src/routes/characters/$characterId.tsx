import { Box, Button, Callout, Flex, Heading, Skeleton } from '@radix-ui/themes';
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
      <Heading mb="4" size="6">
        {character.name}
      </Heading>

      <CharacterFormFields disabled={updateMutation.isPending} onChange={setForm} values={form} />

      <Flex align="center" gap="4" mt="4">
        <Button disabled={!formValid || !isDirty || updateMutation.isPending} onClick={handleSave} type="button">
          Save changes
        </Button>
        {updateMutation.isError ? (
          <Callout.Root color="red" role="alert">
            <Callout.Text>Failed to save character.</Callout.Text>
          </Callout.Root>
        ) : null}
      </Flex>
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
      <Flex direction="column" gap="5">
        <Skeleton height="40px" style={{ maxWidth: 200 }} />
        <Skeleton height="320px" />
      </Flex>
    );
  }

  if (isError || data == null) {
    return (
      <Flex direction="column" gap="4">
        <Callout.Root color="red" role="alert">
          <Callout.Text>Character not found or failed to load.</Callout.Text>
        </Callout.Root>
        <RouterLink to="/characters">Back to characters</RouterLink>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <Flex align="center" gap="4">
        <RouterLink to="/characters">
          <Flex align="center" gap="2">
            <ArrowLeft size={18} /> Characters
          </Flex>
        </RouterLink>
        <Box flexGrow="1" />
        <Button
          color="red"
          onClick={() => {
            setDeleteOpen(true);
          }}
          type="button"
          variant="soft"
        >
          <Trash2 size={18} />
          Delete
        </Button>
      </Flex>

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
    </Flex>
  );
};

export const Route = createFileRoute('/characters/$characterId')({
  component: CharacterDetailPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryCharacter(params.characterId));
  },
});
