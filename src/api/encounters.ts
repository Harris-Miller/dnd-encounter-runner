import { mutationOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { match } from 'ts-pattern';

import { applyTransform } from '../services/encounterReducer';
import type { Transform } from '../services/encounterReducer';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';
import type { EncounterState } from '../types/encounterState';
import { encounterStateSchema } from '../types/encounterState';

import { getCachedProfile } from './profile';

type EncounterRow = Database['public']['Tables']['encounters']['Row'];

export interface EncounterListItem {
  active: boolean;
  combatantCount: number;
  createdAt: string;
  id: string;
  name: string;
  round: number;
  updatedAt: string;
}

export interface EncounterDetail {
  active: boolean;
  createdAt: string;
  id: string;
  name: string;
  state: EncounterState;
  updatedAt: string;
}

const rowToDetail = (row: EncounterRow): EncounterDetail => ({
  active: row.active,
  createdAt: row.created_at ?? '',
  id: row.id,
  name: row.name,
  state: encounterStateSchema.parse(row.state),
  updatedAt: row.updated_at ?? '',
});

const rowToListItem = (row: EncounterRow): EncounterListItem => {
  const state = encounterStateSchema.parse(row.state);

  return {
    active: row.active,
    combatantCount: Object.keys(state.combatants).length,
    createdAt: row.created_at ?? '',
    id: row.id,
    name: row.name,
    round: state.round,
    updatedAt: row.updated_at ?? '',
  };
};

const fetchEncountersList = async (): Promise<EncounterListItem[]> => {
  const { data, error } = await supabase.from('encounters').select('*').order('updated_at', { ascending: false });

  if (error != null) {
    throw error;
  }

  return data.map(rowToListItem);
};

const fetchEncounter = async (encounterId: string): Promise<EncounterDetail> => {
  const { data, error } = await supabase.from('encounters').select('*').eq('id', encounterId).single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const queryEncountersList = queryOptions({
  queryFn: fetchEncountersList,
  queryKey: ['encounters', 'list'] as const,
});

export const queryEncounter = (encounterId: string) =>
  queryOptions({
    queryFn: () => fetchEncounter(encounterId),
    queryKey: ['encounters', 'detail', encounterId] as const,
  });

export interface CreateEncounterInput {
  name?: string;
}

const createEncounterFn = async ({ name = 'Untitled Encounter' }: CreateEncounterInput): Promise<EncounterDetail> => {
  const profile = getCachedProfile();

  if (profile == null) {
    throw new Error('No profile loaded; cannot create encounter');
  }

  const { data, error } = await supabase.from('encounters').insert({ name, profile_id: profile.id }).select().single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const mutateCreateEncounter = mutationOptions({
  mutationFn: createEncounterFn,
  onSuccess: (created, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryEncounter(created.id).queryKey, created);
    client.invalidateQueries({ queryKey: queryEncountersList.queryKey });
  },
});

const deleteEncounterFn = async (encounterId: string): Promise<{ id: string }> => {
  const { error } = await supabase.from('encounters').delete().eq('id', encounterId);

  if (error != null) {
    throw error;
  }

  return { id: encounterId };
};

export const mutateDeleteEncounter = mutationOptions({
  mutationFn: deleteEncounterFn,
  onSuccess: ({ id }, _variables, _onMutateResult, { client }) => {
    client.removeQueries({ queryKey: queryEncounter(id).queryKey });
    client.invalidateQueries({ queryKey: queryEncountersList.queryKey });
  },
});

export interface SetEncounterNameInput {
  encounterId: string;
  name: string;
}

const setEncounterNameFn = async ({ encounterId, name }: SetEncounterNameInput): Promise<EncounterDetail> => {
  const { data, error } = await supabase
    .rpc('encounter_set_name', { p_encounter_id: encounterId, p_name: name })
    .select()
    .single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const mutateSetEncounterName = mutationOptions({
  mutationFn: setEncounterNameFn,
  onSuccess: (updated, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryEncounter(updated.id).queryKey, updated);
    client.invalidateQueries({ queryKey: queryEncountersList.queryKey });
  },
});

export interface SetEncounterActiveInput {
  active: boolean;
  encounterId: string;
}

const setEncounterActiveFn = async ({ active, encounterId }: SetEncounterActiveInput): Promise<EncounterDetail> => {
  const { data, error } = await supabase
    .rpc('encounter_set_active', { p_active: active, p_encounter_id: encounterId })
    .select()
    .single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const mutateSetEncounterActive = mutationOptions({
  mutationFn: setEncounterActiveFn,
  onSuccess: (updated, _variables, _onMutateResult, { client }) => {
    client.setQueryData(queryEncounter(updated.id).queryKey, updated);
    client.invalidateQueries({ queryKey: queryEncountersList.queryKey });
  },
});

const dispatchTransform = async (
  encounterId: string,
  transform: Transform,
  nextState: EncounterState,
): Promise<EncounterState> => {
  const result = await match(transform)
    .with({ type: 'adjustHp' }, async ({ input }) =>
      supabase.rpc('encounter_adjust_hp', {
        p_combatant_id: input.combatantId,
        p_delta: input.delta,
        p_encounter_id: encounterId,
      }),
    )
    .with({ type: 'markReactionUsed' }, async ({ input }) =>
      supabase.rpc('encounter_mark_reaction_used', {
        p_combatant_id: input.combatantId,
        p_encounter_id: encounterId,
        p_used: input.used,
      }),
    )
    .with({ type: 'applyEffect' }, async ({ input }) =>
      supabase.rpc('encounter_apply_effect', {
        p_combatant_id: input.combatantId,
        p_effect: input.effect,
        p_encounter_id: encounterId,
      }),
    )
    .with({ type: 'removeEffect' }, async ({ input }) =>
      supabase.rpc('encounter_remove_effect', {
        p_combatant_id: input.combatantId,
        p_effect_id: input.effectId,
        p_encounter_id: encounterId,
      }),
    )
    .with({ type: 'setInitiative' }, async ({ input }) =>
      supabase.rpc('encounter_set_initiative', {
        p_combatant_id: input.combatantId,
        p_encounter_id: encounterId,
        p_initiative: input.initiative,
      }),
    )
    .with({ type: 'removeCombatant' }, async ({ input }) =>
      supabase.rpc('encounter_remove_combatant', {
        p_combatant_id: input.combatantId,
        p_encounter_id: encounterId,
      }),
    )
    .with({ type: 'dismissReminder' }, async ({ input }) =>
      supabase.rpc('encounter_dismiss_reminder', {
        p_encounter_id: encounterId,
        p_reminder_id: input.reminderId,
      }),
    )
    .with({ type: 'addCombatant' }, async ({ input }) =>
      supabase.rpc('encounter_add_combatant', {
        p_combatant: input.combatant,
        p_encounter_id: encounterId,
        p_next_initiative_order: nextState.initiativeOrder,
      }),
    )
    .with({ type: 'resetActionEconomy' }, async () =>
      // Reset is just a state-equivalent of recordEvent without an event; reuse advance_turn pathway
      supabase.rpc('encounter_record_event', { p_encounter_id: encounterId, p_next_state: nextState }),
    )
    .with({ type: 'advanceTurn' }, async () =>
      supabase.rpc('encounter_advance_turn', { p_encounter_id: encounterId, p_next_state: nextState }),
    )
    .with({ type: 'advanceRound' }, async () =>
      supabase.rpc('encounter_advance_round', { p_encounter_id: encounterId, p_next_state: nextState }),
    )
    .with({ type: 'recordEvent' }, async () =>
      supabase.rpc('encounter_record_event', { p_encounter_id: encounterId, p_next_state: nextState }),
    )
    .exhaustive();

  if (result.error != null) {
    throw result.error;
  }

  return encounterStateSchema.parse(result.data);
};

export interface ApplyTransformContext {
  snapshot: EncounterDetail | undefined;
}

/**
 * Hook for applying an encounter transform. The mutation:
 *
 * 1. Synchronously computes the optimistic next state via the client reducer
 *    using the snapshot in the query cache, and writes it back.
 * 2. Dispatches the corresponding RPC to Supabase, which atomically applies
 *    the transform server-side and returns the authoritative state.
 * 3. Replaces the cache with the server's authoritative state on success;
 *    rolls back to the snapshot on error.
 */
export const useApplyTransform = (
  encounterId: string,
): UseMutationResult<EncounterState, Error, Transform, ApplyTransformContext> => {
  const client = useQueryClient();
  const { queryKey } = queryEncounter(encounterId);

  return useMutation<EncounterState, Error, Transform, ApplyTransformContext>({
    mutationFn: async transform => {
      const cached = client.getQueryData<EncounterDetail>(queryKey);

      if (cached == null) {
        throw new Error(`No cached encounter "${encounterId}" — cannot apply transform.`);
      }

      const nextState = applyTransform(cached.state, transform);
      return dispatchTransform(encounterId, transform, nextState);
    },
    onError: (_error, _transform, context) => {
      if (context?.snapshot != null) {
        client.setQueryData(queryKey, context.snapshot);
      }
    },
    onMutate: async transform => {
      await client.cancelQueries({ queryKey });

      const snapshot = client.getQueryData<EncounterDetail>(queryKey);

      if (snapshot != null) {
        const optimisticState = applyTransform(snapshot.state, transform);
        client.setQueryData<EncounterDetail>(queryKey, { ...snapshot, state: optimisticState });
      }

      return { snapshot };
    },
    onSuccess: nextServerState => {
      const existing = client.getQueryData<EncounterDetail>(queryKey);

      if (existing != null) {
        client.setQueryData<EncounterDetail>(queryKey, { ...existing, state: nextServerState });
      }

      client.invalidateQueries({ queryKey: queryEncountersList.queryKey });
    },
  });
};
