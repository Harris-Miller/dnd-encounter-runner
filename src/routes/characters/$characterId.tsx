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
      <h1 style={{ fontSize: '1.5rem', margin: '0 0 1rem' }}>{character.name}</h1>

      <CharacterFormFields disabled={updateMutation.isPending} onChange={setForm} values={form} />

      <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginTop: '1rem' }}>
        <button disabled={!formValid || !isDirty || updateMutation.isPending} onClick={handleSave} type="button">
          Save changes
        </button>
        {updateMutation.isError ? (
          <div className="alert alert-error" role="alert">
            Failed to save character.
          </div>
        ) : null}
      </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ height: 40, maxWidth: 200 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </div>
    );
  }

  if (isError || data == null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="alert alert-error" role="alert">
          Character not found or failed to load.
        </div>
        <RouterLink to="/characters">Back to characters</RouterLink>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
        <RouterLink style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }} to="/characters">
          <ArrowLeft size={18} /> Characters
        </RouterLink>
        <span className="flex-grow" />
        <button
          onClick={() => {
            setDeleteOpen(true);
          }}
          style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
          type="button"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

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
    </div>
  );
};

export const Route = createFileRoute('/characters/$characterId')({
  component: CharacterDetailPage,
  loader: async ({ params }) => {
    await fetchQueryOrNotFound(queryClient, queryCharacter(params.characterId));
  },
});
