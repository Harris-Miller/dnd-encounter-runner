import { create } from 'zustand';

import { generateReminders } from '../services/reminderEngine';
import type { Character, Encounter, StandardCondition } from '../types/encounter';
import type { TriggerEvent } from '../types/triggers';

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
      return;
    }

    const newCharacter: Character = {
      ...characterData,
      activeEffects: [],
      id: `character-${Date.now()}-${Math.random()}`,
    };

    set({
      encounter: {
        ...encounter,
        characters: [...encounter.characters, newCharacter].sort((a, b) => b.initiative - a.initiative),
      },
    });
  },

  addCondition: (characterId: string, conditionId: StandardCondition, source: string, duration?: number) => {
    const { encounter } = get();
    if (!encounter) {
      return;
    }

    const newEffect = {
      appliedAt: Date.now(),
      conditionId,
      duration,
      id: `effect-${Date.now()}-${Math.random()}`,
      remainingTurns: duration,
      source,
    };

    set({
      encounter: {
        ...encounter,
        characters: encounter.characters.map(char => {
          if (char.id !== characterId) {
            return char;
          }

          // If adding concentration, remove any existing concentration first
          // (you can only concentrate on one spell at a time)
          let updatedEffects = char.activeEffects;
          if (conditionId === 'concentrating') {
            updatedEffects = updatedEffects.filter(effect => effect.conditionId !== 'concentrating');
          }

          return {
            ...char,
            activeEffects: [...updatedEffects, newEffect],
          };
        }),
      },
    });
  },

  clearReminderLog: () => {
    const { encounter } = get();
    if (!encounter) {
      return;
    }

    set({
      encounter: {
        ...encounter,
        reminderLog: [],
      },
    });
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
      return;
    }

    const character = encounter.characters.find(char => char.id === event.characterId);

    if (!character) {
      return;
    }

    const reminders = generateReminders(character, event, damageType);

    if (reminders.length > 0) {
      set({
        encounter: {
          ...encounter,
          reminderLog: [...encounter.reminderLog, ...reminders],
        },
      });
    }
  },

  removeCharacter: (characterId: string) => {
    const { encounter } = get();
    if (!encounter) {
      return;
    }

    set({
      encounter: {
        ...encounter,
        characters: encounter.characters.filter(char => char.id !== characterId),
      },
    });
  },

  removeCondition: (characterId: string, effectId: string) => {
    const { encounter } = get();
    if (!encounter) {
      return;
    }

    set({
      encounter: {
        ...encounter,
        characters: encounter.characters.map(char =>
          char.id === characterId
            ? {
                ...char,
                activeEffects: char.activeEffects.filter(effect => effect.id !== effectId),
              }
            : char,
        ),
      },
    });
  },

  updateCharacterInitiative: (characterId: string, initiative: number) => {
    const { encounter } = get();
    if (!encounter) {
      return;
    }

    set({
      encounter: {
        ...encounter,
        characters: encounter.characters
          .map(char => (char.id === characterId ? { ...char, initiative } : char))
          .sort((a, b) => b.initiative - a.initiative),
      },
    });
  },
}));
