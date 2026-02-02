import * as R from 'ramda';
import { create } from 'zustand';

import { generateReminders } from '../services/reminderEngine';
import type { Character, Encounter, StandardCondition } from '../types/encounter';
import type { TriggerEvent } from '../types/triggers';
import { sortBy } from '../utils/sortBy';

interface EncounterStore {
  addCharacter: (character: Omit<Character, 'activeEffects' | 'id'>) => void;
  addCondition: (characterId: string, conditionId: StandardCondition, source: string, duration?: number) => void;
  clearReminderLog: () => void;
  createEncounter: () => void;
  encounter: Encounter | null;
  recordEvent: (event: TriggerEvent, damageType?: string) => void;
  removeCharacter: (characterId: string) => void;
  removeCondition: (characterId: string, effectId: string) => void;
  updateCharacterInitiative: (characterId: string, initiative: number) => void;
}

export const useEncounterStore = create<EncounterStore>((set, get) => ({
  addCharacter: (characterData: Omit<Character, 'activeEffects' | 'id'>) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const newCharacter: Character = {
      ...characterData,
      activeEffects: [],
      id: `character-${Date.now()}-${Math.random()}`,
    };

    const nextCharacters = R.append(newCharacter, encounter.characters).sort(sortBy(char => char.initiative));

    set(R.assocPath(['encounter', 'characters'], nextCharacters));
  },

  addCondition: (characterId: string, conditionId: StandardCondition, source: string, duration?: number) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const newEffect = {
      appliedAt: Date.now(),
      conditionId,
      duration,
      id: `effect-${Date.now()}-${Math.random()}`,
      remainingTurns: duration,
      source,
    };

    const characterIndex = encounter.characters.findIndex(char => char.id === characterId);

    if (characterIndex === -1) {
      throw new Error('Attempted to add a condition for a character that does not exist.');
    }

    const updatedEffects = R.flow(encounter.characters[characterIndex].activeEffects, [
      R.when(
        () => conditionId === 'concentrating',
        ae => ae.filter(effect => effect.conditionId !== 'concentrating'),
      ),
      R.append(newEffect),
    ]);

    set(R.assocPath(['encounter', 'characters', characterIndex, 'activeEffects'], updatedEffects));
  },

  clearReminderLog: () => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    set(R.assocPath(['encounter', 'reminderLog'], []));
  },

  createEncounter: () => {
    set({
      encounter: {
        characters: [],
        id: `encounter-${Date.now()}`,
        reminderLog: [],
      },
    });
  },

  encounter: null,

  recordEvent: (event: TriggerEvent, damageType?: string) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const character = encounter.characters.find(char => char.id === event.characterId);

    if (!character) {
      throw new Error('Attempted to record an event for a character that does not exist.');
    }

    const reminders = generateReminders(character, event, damageType);

    if (reminders.length > 0) {
      set(R.assocPath(['encounter', 'reminderLog'], R.concat(encounter.reminderLog, reminders)));
    }
  },

  removeCharacter: (characterId: string) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const nextCharacters = encounter.characters.filter(char => char.id !== characterId);
    set(R.assocPath(['encounter', 'characters'], nextCharacters));
  },

  removeCondition: (characterId: string, effectId: string) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const indexOfCharacter = encounter.characters.findIndex(char => char.id === characterId);

    if (indexOfCharacter === -1) {
      throw new Error('Attempted to remove a condition for a character that does not exist.');
    }

    const updatedEffects = encounter.characters[indexOfCharacter].activeEffects.filter(
      effect => effect.id !== effectId,
    );

    set(R.assocPath(['encounter', 'characters', indexOfCharacter, 'activeEffects'], updatedEffects));
  },

  updateCharacterInitiative: (characterId: string, initiative: number) => {
    const { encounter } = get();
    if (!encounter) {
      throw new Error('Attempted to update the encounter state with no active encounter.');
    }

    const nextCharacters = encounter.characters
      .map(char => (char.id === characterId ? { ...char, initiative } : char))
      .sort(sortBy(char => char.initiative));

    set(R.assocPath(['encounter', 'characters'], nextCharacters));
  },
}));
