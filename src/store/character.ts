import * as R from 'ramda';
import { ulid } from 'ulid';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import type { CombatantCommon, StandardDbProps } from './shared.types';

export interface CharacterInput extends CombatantCommon {
  level: number;
}

export interface Character extends CharacterInput, StandardDbProps {}

interface CharacterStore {
  addCharacter: (character: CharacterInput) => void;
  characters: Record<string, Character>;
  updateCharacter: (id: string, monsterInput: CharacterInput) => void;
}

const characterLens = R.lensProp<CharacterStore, 'characters'>('characters');

export const characterStore = createStore<CharacterStore>()((set, get) => ({
  addCharacter: (characterInput: CharacterInput) => {
    const id = ulid();
    const dateNowIsoString = new Date(Date.now()).toISOString();
    const newCharacter: Character = {
      ...characterInput,
      createdAt: dateNowIsoString,
      id,
      updatedAt: dateNowIsoString,
    };

    set(R.over(characterLens, R.assoc(id, newCharacter)));
  },
  characters: {},
  updateCharacter: (id: string, characterInput: CharacterInput) => {
    const character = get().characters[id];

    if (character == null) {
      throw new Error(`Unable to update Monster of id "${id}". That monster does not exist`);
    }

    const dateNowIsoString = new Date(Date.now()).toISOString();
    const updatedCharacter: Character = {
      ...character,
      ...characterInput,
      updatedAt: dateNowIsoString,
    };

    set(state => ({
      characters: { ...state.characters, [id]: updatedCharacter },
    }));
  },
}));

export const useCharacterStore = <T>(selector: (state: CharacterStore) => T): T => useStore(characterStore, selector);
