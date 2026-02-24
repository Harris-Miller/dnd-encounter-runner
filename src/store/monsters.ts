import { ulid } from 'ulid';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { CombatantCommon, StandardDbProps } from './shared.types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MonsterInput extends CombatantCommon {}

export interface Monster extends MonsterInput, StandardDbProps {}

interface MonsterStore {
  addMonster: (monsterInput: MonsterInput) => void;
  monsters: Record<string, Monster>;
  updateMonster: (id: string, monsterInput: MonsterInput) => void;
}

export const monsterStore = createStore<MonsterStore>()((set, get) => ({
  addMonster: (monsterInput: MonsterInput) => {
    const id = ulid();
    const dateNowIsoString = new Date(Date.now()).toISOString();
    const newMonster: Monster = {
      ...monsterInput,
      createdAt: dateNowIsoString,
      id,
      updatedAt: dateNowIsoString,
    };

    set(state => ({
      monsters: { ...state.monsters, [id]: newMonster },
    }));
  },
  monsters: {},
  updateMonster: (id: string, monsterInput: MonsterInput) => {
    const monster = get().monsters[id];

    if (monster == null) {
      throw new Error(`Unable to update Monster of id "${id}". That monster does not exist`);
    }

    const dateNowIsoString = new Date(Date.now()).toISOString();
    const updatedMonster: Monster = {
      ...monster,
      ...monsterInput,
      updatedAt: dateNowIsoString,
    };

    set(state => ({
      monsters: { ...state.monsters, [id]: updatedMonster },
    }));
  },
}));

export const useMonsterStore = <T>(selector: (state: MonsterStore) => T): T => useStore(monsterStore, selector);
