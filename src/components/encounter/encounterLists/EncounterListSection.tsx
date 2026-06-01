import { Box, Button, Callout, Dialog, Flex, Heading, Skeleton, Text, TextField } from '@radix-ui/themes';
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
    <Flex direction="column" gap="4">
      {showHeading ? (
        <Flex align="center" gap="4">
          <Heading size="5">Encounters</Heading>
          <Box flexGrow="1" />
          {isOwner ? (
            <Button onClick={handleCreateOpen} type="button">
              <Plus size={18} />
              New encounter
            </Button>
          ) : null}
        </Flex>
      ) : isOwner ? (
        <Flex justify="end">
          <Button onClick={handleCreateOpen} type="button">
            <Plus size={18} />
            New encounter
          </Button>
        </Flex>
      ) : null}

      {isLoading ? (
        <Flex direction="column" gap="4">
          <Skeleton height="96px" />
          <Skeleton height="96px" />
        </Flex>
      ) : null}

      {isError ? (
        <Callout.Root color="red" role="alert">
          <Callout.Text>Failed to load encounters.</Callout.Text>
        </Callout.Root>
      ) : null}

      {!isLoading && !isError && encounters.length === 0 ? (
        <Callout.Root color="blue" role="status">
          <Callout.Text>
            {isOwner ? (
              <>
                No encounters yet. Click <strong>New encounter</strong> to get started.
              </>
            ) : (
              'No encounters in this campaign yet.'
            )}
          </Callout.Text>
        </Callout.Root>
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
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>New encounter</Dialog.Title>
          <Flex direction="column" gap="1" mt="4">
            <Text as="label" htmlFor="encounter-create-name" size="2" weight="medium">
              Encounter name
            </Text>
            <TextField.Root
              id="encounter-create-name"
              onChange={event => {
                setCreateDraft(event.target.value);
              }}
              placeholder="Untitled Encounter"
              value={createDraft ?? ''}
            />
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleCreateClose} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={createMutation.isPending} onClick={handleCreateConfirm} type="button">
              Create
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            handleDeleteCancel();
          }
        }}
        open={pendingDeleteId !== null}
      >
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>Delete encounter</Dialog.Title>
          <Text as="p" mt="4">
            Delete <strong>{pendingDeleteEncounter?.name ?? 'this encounter'}</strong>? This cannot be undone.
          </Text>
          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button color="gray" onClick={handleDeleteCancel} type="button" variant="soft">
                Cancel
              </Button>
            </Dialog.Close>
            <Button color="red" disabled={deleteMutation.isPending} onClick={handleDeleteConfirm} type="button">
              Delete
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
};
