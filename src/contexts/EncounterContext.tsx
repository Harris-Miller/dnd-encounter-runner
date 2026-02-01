import type { FC, PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { generateReminders } from '../services/reminderEngine';
import type { Character, Encounter, StandardCondition } from '../types/encounter';
import type { TriggerEvent } from '../types/triggers';

interface EncounterContextValue {
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

const EncounterContext = createContext<EncounterContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useEncounter = (): EncounterContextValue => {
  const context = useContext(EncounterContext);
  if (!context) {
    throw new Error('useEncounter must be used within EncounterProvider');
  }
  return context;
};

export const EncounterProvider: FC<PropsWithChildren> = ({ children }) => {
  const [encounter, setEncounter] = useState<Encounter | null>(null);

  const createEncounter = useCallback(() => {
    setEncounter({
      characters: [],
      id: `encounter-${Date.now()}`,
      reminderLog: [],
    });
  }, []);

  const addCharacter = useCallback(
    (characterData: Omit<Character, 'activeEffects' | 'id'>) => {
      if (!encounter) {
        return;
      }

      const newCharacter: Character = {
        ...characterData,
        activeEffects: [],
        id: `character-${Date.now()}-${Math.random()}`,
      };

      setEncounter({
        ...encounter,
        characters: [...encounter.characters, newCharacter].sort((a, b) => b.initiative - a.initiative),
      });
    },
    [encounter],
  );

  const removeCharacter = useCallback(
    (characterId: string) => {
      if (!encounter) {
        return;
      }

      setEncounter({
        ...encounter,
        characters: encounter.characters.filter(char => char.id !== characterId),
      });
    },
    [encounter],
  );

  const updateCharacterInitiative = useCallback(
    (characterId: string, initiative: number) => {
      if (!encounter) {
        return;
      }

      setEncounter({
        ...encounter,
        characters: encounter.characters
          .map(char => (char.id === characterId ? { ...char, initiative } : char))
          .sort((a, b) => b.initiative - a.initiative),
      });
    },
    [encounter],
  );

  const addCondition = useCallback(
    (characterId: string, conditionId: StandardCondition, source: string, duration?: number) => {
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

      setEncounter({
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
      });
    },
    [encounter],
  );

  const removeCondition = useCallback(
    (characterId: string, effectId: string) => {
      if (!encounter) {
        return;
      }

      setEncounter({
        ...encounter,
        characters: encounter.characters.map(char =>
          char.id === characterId
            ? {
                ...char,
                activeEffects: char.activeEffects.filter(effect => effect.id !== effectId),
              }
            : char,
        ),
      });
    },
    [encounter],
  );

  const recordEvent = useCallback(
    (event: TriggerEvent, damageType?: string) => {
      if (!encounter) {
        return;
      }

      const character = encounter.characters.find(char => char.id === event.characterId);

      if (!character) {
        return;
      }

      const reminders = generateReminders(character, event, damageType);

      if (reminders.length > 0) {
        setEncounter({
          ...encounter,
          reminderLog: [...encounter.reminderLog, ...reminders],
        });
      }
    },
    [encounter],
  );

  const clearReminderLog = useCallback(() => {
    if (!encounter) {
      return;
    }

    setEncounter({
      ...encounter,
      reminderLog: [],
    });
  }, [encounter]);

  const value = useMemo<EncounterContextValue>(
    () => ({
      addCharacter,
      addCondition,
      clearReminderLog,
      createEncounter,
      encounter,
      recordEvent,
      removeCharacter,
      removeCondition,
      updateCharacterInitiative,
    }),
    [
      encounter,
      createEncounter,
      addCharacter,
      removeCharacter,
      updateCharacterInitiative,
      addCondition,
      removeCondition,
      recordEvent,
      clearReminderLog,
    ],
  );

  return <EncounterContext.Provider value={value}>{children}</EncounterContext.Provider>;
};
