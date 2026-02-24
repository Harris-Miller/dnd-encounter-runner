import * as R from 'ramda';
import { ulid } from 'ulid';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import { characterStore } from './character';
import { monsterStore } from './monsters';
import type { CombatantCommon, StandardDbProps } from './shared.types';

export interface Condition {
  cause: string;
  name: string;
  notifyOn: 'CAST_SPELL' | 'END_OF_TURN' | 'ON_ATTACK' | 'RECEIVE_DAMAGE' | 'START_OF_TURN';
  provides: string[];
  removeAfter: 'END_OF_TURN' | 'NEVER' | 'ON_ATTACK';
  trigger: string;
}

export interface Combatant extends StandardDbProps, CombatantCommon {
  conditions: unknown[];
  id: string;
  initiative: number | null;
  refId: string;
  type: 'character' | 'monster';
}

export interface Encounter extends StandardDbProps {
  active: boolean;
  combatants: Record<string, Combatant>;
  /** id of one of the combatants */
  currentInitiative: string | null;
  name: string;
}

interface EncounterStore {
  addCombatant: (encounterId: string, combatantType: 'character' | 'monster', refId: string) => void;
  changeActiveStatus: (id: string, active: boolean) => void;
  create: () => void;
  delete: (encounterId: string) => void;
  encounters: Record<string, Encounter>;
  removeCombatant: (encounterId: string, combatantId: string) => void;
  setCurrentInitiative: (encounterId: string, combatantId: string) => void;
  updateCombatant: (encounterId: string, combatantId: string) => void;
}

export const encounterStore = createStore<EncounterStore>()((set, get) => ({
  addCombatant: (encounterId: string, combatantType: 'character' | 'monster', refId: string) => {
    const encounter = get().encounters[encounterId];

    if (encounter == null) {
      throw new Error(`Encounter "${encounterId}" not found`);
    }

    const characterOrMonster: CombatantCommon | null =
      combatantType === 'character'
        ? (Object.values(characterStore.getState().characters).find(char => char.id === refId) ?? null)
        : (Object.values(monsterStore.getState().monsters).find(mon => mon.id === refId) ?? null);

    if (characterOrMonster == null) {
      throw new Error(`No ${combatantType} of "${refId}" found`);
    }

    const id = ulid();
    const dateNowIsoString = new Date(Date.now()).toISOString();
    const combatant: Combatant = {
      ...characterOrMonster,
      conditions: [],
      createdAt: dateNowIsoString,
      id,
      initiative: null,
      refId,
      type: combatantType,
      updatedAt: dateNowIsoString,
    };

    const updatedEncounter: Encounter = {
      ...encounter,
      combatants: { ...encounter.combatants, [id]: combatant },
    };

    set(state => ({ encounters: { ...state.encounters, [encounterId]: updatedEncounter } }));
  },

  changeActiveStatus: (id: string, active: boolean) => {
    const encounter = get().encounters[id];

    if (encounter == null) {
      throw new Error(`Tried to activate encounter ${id}. Now encounter with that id exists`);
    }

    const updatedEncounter = {
      ...encounter,
      active,
    };

    set(state => ({ encounters: { ...state.encounters, [id]: updatedEncounter } }));
  },

  create: () => {
    const id = ulid();
    const dateNowIsoString = new Date(Date.now()).toISOString();
    const newEncounter: Encounter = {
      active: false,
      combatants: {},
      createdAt: dateNowIsoString,
      currentInitiative: null,
      id,
      name: 'My Encounter',
      updatedAt: dateNowIsoString,
    };
    set(store => ({ encounters: { ...store.encounters, [id]: newEncounter } }));
  },

  delete: (encounterId: string) => {
    set(state => ({ encounters: R.dissoc(encounterId, state.encounters) }));
  },

  encounters: {},

  removeCombatant: (encounterId: string, combatantId: string) => {
    const encounter = get().encounters[encounterId];

    if (encounter == null) {
      throw new Error(`Encounter "${encounterId}" not found`);
    }

    const updatedEncounter: Encounter = {
      ...encounter,
      combatants: R.dissoc(combatantId, encounter.combatants),
    };

    set(state => ({ encounters: { ...state.encounters, [encounterId]: updatedEncounter } }));
  },
  setCurrentInitiative: (encounterId: string, combatantId: string) => {
    const encounter = get().encounters[encounterId];

    if (encounter == null) {
      throw new Error(`Encounter "${encounterId}" not found`);
    }

    const combatant = Object.values(encounter.combatants).find(c => c.id === combatantId);

    if (combatant == null) {
      throw new Error(`No combatant with id "${combatantId}" found`);
    }

    const updatedEncounter: Encounter = {
      ...encounter,
      currentInitiative: combatantId,
    };

    set(state => ({
      encounters: {
        ...state.encounters,
        [encounterId]: updatedEncounter,
      },
    }));
  },
  updateCombatant: (encounterId: string, combatantId: string) => {
    const encounter = get().encounters[encounterId];

    if (encounter == null) {
      throw new Error(`Encounter "${encounterId}" not found`);
    }

    const updatedInitiative = encounter.currentInitiative === combatantId ? null : encounter.currentInitiative;

    const updatedCombatants = R.dissoc(combatantId, encounter.combatants);

    const updatedEncounter: Encounter = {
      ...encounter,
      combatants: updatedCombatants,
      currentInitiative: updatedInitiative,
    };

    set(state => ({ encounters: { ...state.encounters, [encounterId]: updatedEncounter } }));
  },
}));

export const useEncounterStore = <T>(selector: (state: EncounterStore) => T): T => useStore(encounterStore, selector);
