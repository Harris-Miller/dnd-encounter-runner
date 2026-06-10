import { config } from 'dotenv';
import postgres from 'postgres';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { randomUUID } from 'node:crypto';
import process from 'node:process';

import type { EncounterState } from '../../types/encounterState';
import {
  addCombatant,
  adjustHp,
  applyEffect,
  dismissReminder,
  markReactionUsed,
  removeCombatant,
  removeEffect,
  setInitiative,
} from '../encounterReducer';
import type {
  AddCombatantInput,
  AdjustHpInput,
  ApplyEffectInput,
  DismissReminderInput,
  MarkReactionUsedInput,
  RemoveCombatantInput,
  RemoveEffectInput,
  SetInitiativeInput,
} from '../encounterReducer';

import { buildCombatant, buildEffect, buildState } from './fixtures';

config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL;

const describeIfDb = databaseUrl != null && databaseUrl !== '' ? describe : describe.skip;

const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
const TEST_USER_EMAIL = 'rpc-parity@example.test';

// needed because of how we're using describeIfDb
/* eslint-disable vitest/require-top-level-describe */
describeIfDb('RPC parity (server JSONB transforms vs client reducer)', () => {
  let sql: ReturnType<typeof postgres>;
  let profileId: string;
  let campaignId: string;
  const createdEncounterIds: string[] = [];

  beforeAll(async () => {
    sql = postgres(databaseUrl!, { onnotice: () => undefined });

    await sql`
      INSERT INTO auth.users (id, email, instance_id, aud, role)
      VALUES (
        ${TEST_USER_ID}::uuid,
        ${TEST_USER_EMAIL},
        '00000000-0000-0000-0000-000000000000'::uuid,
        'authenticated',
        'authenticated'
      )
      ON CONFLICT (id) DO NOTHING
    `;

    const profileRows = await sql<{ id: string }[]>`
      SELECT id FROM public.profiles WHERE id = ${TEST_USER_ID}::uuid LIMIT 1
    `;
    const [existingProfile] = profileRows;

    if (existingProfile != null) {
      profileId = existingProfile.id;
    } else {
      const inserted = await sql<{ id: string }[]>`
        INSERT INTO public.profiles (id, name)
        VALUES (${TEST_USER_ID}::uuid, 'Parity Test')
        RETURNING id
      `;
      const [insertedRow] = inserted;
      if (insertedRow == null) {
        throw new Error('Failed to create test profile');
      }
      profileId = insertedRow.id;
    }

    const campaignRows = await sql<{ id: string }[]>`
      SELECT id FROM public.campaigns WHERE profile_id = ${profileId}::uuid LIMIT 1
    `;
    const [existingCampaign] = campaignRows;

    if (existingCampaign != null) {
      campaignId = existingCampaign.id;
    } else {
      const insertedCampaign = await sql<{ id: string }[]>`
        INSERT INTO public.campaigns (profile_id, name)
        VALUES (${profileId}::uuid, 'Parity Campaign')
        RETURNING id
      `;
      const [insertedCampaignRow] = insertedCampaign;
      if (insertedCampaignRow == null) {
        throw new Error('Failed to create test campaign');
      }
      campaignId = insertedCampaignRow.id;
    }
  });

  afterEach(async () => {
    const idsToDelete = [...createdEncounterIds];
    if (idsToDelete.length > 0) {
      await sql`DELETE FROM public.encounters WHERE id = ANY(${idsToDelete}::uuid[])`;
    }
  });

  afterAll(async () => {
    await sql`DELETE FROM public.encounters WHERE profile_id = ${profileId}::uuid`;
    await sql.end({ timeout: 5 });
  });

  const seedEncounter = async (state: EncounterState): Promise<string> => {
    const id = randomUUID();
    await sql`
      INSERT INTO public.encounters (id, profile_id, campaign_id, name, state)
      VALUES (${id}::uuid, ${profileId}::uuid, ${campaignId}::uuid, 'Parity Encounter', ${sql.json(state)})
    `;
    createdEncounterIds.push(id);
    return id;
  };

  const firstResult = <T>(rows: { result: T }[]): T => {
    const [first] = rows;
    if (first == null) {
      throw new Error('RPC returned no rows');
    }
    return first.result;
  };

  it('encounter_adjust_hp matches reducer.adjustHp', async () => {
    const baseState = buildState([buildCombatant({ currentHp: 25, id: 'a', maxHp: 30, name: 'A' })]);
    const encounterId = await seedEncounter(baseState);
    const input: AdjustHpInput = { combatantId: 'a', delta: -7 };

    const clientNextState = adjustHp(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_adjust_hp(${encounterId}::uuid, ${input.combatantId}, ${input.delta}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_mark_reaction_used matches reducer.markReactionUsed', async () => {
    const baseState = buildState([buildCombatant({ id: 'a', name: 'A' })]);
    const encounterId = await seedEncounter(baseState);
    const input: MarkReactionUsedInput = { combatantId: 'a', used: true };

    const clientNextState = markReactionUsed(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_mark_reaction_used(${encounterId}::uuid, ${input.combatantId}, ${input.used}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_apply_effect matches reducer.applyEffect', async () => {
    const baseState = buildState([buildCombatant({ id: 'a', name: 'A' })]);
    const encounterId = await seedEncounter(baseState);
    const effect = buildEffect({ id: 'eff-1', name: 'Bless', provides: [] });
    const input: ApplyEffectInput = { combatantId: 'a', effect };

    const clientNextState = applyEffect(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_apply_effect(${encounterId}::uuid, ${input.combatantId}, ${sql.json(effect)}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_remove_effect matches reducer.removeEffect', async () => {
    const effect = buildEffect({ id: 'eff-1', name: 'Bless', provides: [] });
    const baseState = buildState([buildCombatant({ effects: [effect], id: 'a', name: 'A' })]);
    const encounterId = await seedEncounter(baseState);
    const input: RemoveEffectInput = { combatantId: 'a', effectId: 'eff-1' };

    const clientNextState = removeEffect(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_remove_effect(${encounterId}::uuid, ${input.combatantId}, ${input.effectId}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_set_initiative matches reducer.setInitiative', async () => {
    const baseState = buildState([
      buildCombatant({ id: 'a', initiative: 12, name: 'A' }),
      buildCombatant({ id: 'b', initiative: 8, name: 'B' }),
    ]);
    const encounterId = await seedEncounter(baseState);
    const input: SetInitiativeInput = { combatantId: 'b', initiative: 22 };

    const clientNextState = setInitiative(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_set_initiative(${encounterId}::uuid, ${input.combatantId}, ${input.initiative}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_remove_combatant matches reducer.removeCombatant', async () => {
    const baseState: EncounterState = {
      ...buildState([
        buildCombatant({ id: 'a', initiative: 15, name: 'A' }),
        buildCombatant({ id: 'b', initiative: 10, name: 'B' }),
      ]),
      turnIndex: 1,
    };
    const encounterId = await seedEncounter(baseState);
    const input: RemoveCombatantInput = { combatantId: 'b' };

    const clientNextState = removeCombatant(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_remove_combatant(${encounterId}::uuid, ${input.combatantId}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_dismiss_reminder matches reducer.dismissReminder', async () => {
    const baseState: EncounterState = {
      ...buildState([buildCombatant({ id: 'a', name: 'A' })]),
      reminders: [
        {
          combatantId: 'a',
          dismissed: false,
          effectId: null,
          eventId: null,
          id: 'rem-1',
          kind: 'info',
          message: 'hi',
          ts: '2026-05-25T00:00:00.000Z',
        },
      ],
    };
    const encounterId = await seedEncounter(baseState);
    const input: DismissReminderInput = { reminderId: 'rem-1' };

    const clientNextState = dismissReminder(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_dismiss_reminder(${encounterId}::uuid, ${input.reminderId}) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });

  it('encounter_add_combatant matches reducer.addCombatant', async () => {
    const baseState = buildState([buildCombatant({ id: 'a', initiative: 12, name: 'A' })]);
    const encounterId = await seedEncounter(baseState);
    const newCombatant = buildCombatant({ id: 'b', initiative: 20, name: 'B' });
    const input: AddCombatantInput = { combatant: newCombatant };

    const clientNextState = addCombatant(baseState, input);
    const rows = await sql<{ result: EncounterState }[]>`
      SELECT encounter_add_combatant(
        ${encounterId}::uuid,
        ${sql.json(newCombatant)},
        ${sql.json(clientNextState.initiativeOrder)}
      ) AS result
    `;

    expect(firstResult(rows)).toStrictEqual(clientNextState);
  });
});
/* eslint-enable vitest/require-top-level-describe */
