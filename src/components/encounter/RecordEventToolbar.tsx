import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { useMemo, useState } from 'react';
import type { FC } from 'react';

import type { Combatant, EncounterEvent, EncounterState, TriggerEvent } from '../../types/encounterState';

const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
];

const ATTACK_EVENT_TYPES: TriggerEvent[] = ['ON_ATTACK', 'ON_HIT', 'ON_MISS', 'ON_CRIT'];

type DialogKind = 'attack' | 'damage' | 'spell' | null;

interface AttackForm {
  attackerId: string;
  kind: 'ATTACK' | 'CRIT' | 'HIT' | 'MISS';
  targetId: string;
}

interface DamageForm {
  amount: number;
  damageType: string;
  sourceId: string;
  targetId: string;
}

interface SpellForm {
  casterId: string;
  isConcentration: boolean;
  spellName: string;
  targetIds: string[];
}

const buildAttackEvent = (form: AttackForm, factories: { id: string; ts: string }): EncounterEvent => {
  const payload = { attackerCombatantId: form.attackerId, targetCombatantId: form.targetId };

  switch (form.kind) {
    case 'ATTACK':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_ATTACK' };
    case 'CRIT':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_CRIT' };
    case 'HIT':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_HIT' };
    case 'MISS':
      return { id: factories.id, payload, ts: factories.ts, type: 'ON_MISS' };
    default:
      throw new Error(`Unknown attack kind "${String(form.kind)}"`);
  }
};

const buildDamageEvent = (form: DamageForm, factories: { id: string; ts: string }): EncounterEvent => ({
  id: factories.id,
  payload: {
    amount: form.amount,
    damageType: form.damageType,
    sourceCombatantId: form.sourceId === '' ? null : form.sourceId,
    targetCombatantId: form.targetId,
  },
  ts: factories.ts,
  type: 'ON_DAMAGE',
});

const buildSpellEvent = (form: SpellForm, factories: { id: string; ts: string }): EncounterEvent => ({
  id: factories.id,
  payload: {
    casterCombatantId: form.casterId,
    isConcentration: form.isConcentration,
    spellName: form.spellName,
    targetCombatantIds: form.targetIds,
  },
  ts: factories.ts,
  type: 'ON_SPELL_CAST',
});

export interface RecordEventToolbarProps {
  onAdvanceRound: () => void;
  onRecordEvent: (event: EncounterEvent) => void;
  state: EncounterState;
}

export const RecordEventToolbar: FC<RecordEventToolbarProps> = ({ onAdvanceRound, onRecordEvent, state }) => {
  const combatants = useMemo<Combatant[]>(() => Object.values(state.combatants), [state.combatants]);
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [attackForm, setAttackForm] = useState<AttackForm>({
    attackerId: '',
    kind: 'HIT',
    targetId: '',
  });
  const [damageForm, setDamageForm] = useState<DamageForm>({
    amount: 0,
    damageType: 'slashing',
    sourceId: '',
    targetId: '',
  });
  const [spellForm, setSpellForm] = useState<SpellForm>({
    casterId: '',
    isConcentration: false,
    spellName: '',
    targetIds: [],
  });

  const closeDialog = () => {
    setOpenDialog(null);
  };

  const buildFactories = () => ({ id: crypto.randomUUID(), ts: new Date().toISOString() });

  const handleAttackSubmit = () => {
    if (attackForm.attackerId === '' || attackForm.targetId === '') return;
    onRecordEvent(buildAttackEvent(attackForm, buildFactories()));
    closeDialog();
  };

  const handleDamageSubmit = () => {
    if (damageForm.targetId === '' || damageForm.amount <= 0) return;
    onRecordEvent(buildDamageEvent(damageForm, buildFactories()));
    closeDialog();
  };

  const handleSpellSubmit = () => {
    if (spellForm.casterId === '' || spellForm.spellName.trim() === '') return;
    onRecordEvent(buildSpellEvent({ ...spellForm, spellName: spellForm.spellName.trim() }, buildFactories()));
    closeDialog();
  };

  const combatantOptions = combatants.map(combatant => (
    <option key={combatant.id} value={combatant.id}>
      {combatant.name}
    </option>
  ));

  return (
    <article className="card-outlined">
      <div className="card-content">
        <h2 style={{ fontSize: '1.125rem', margin: '0 0 1rem' }}>Record Event</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ATTACK_EVENT_TYPES.map(eventType => {
            const kind = eventType.replace('ON_', '') as AttackForm['kind'];
            const label = kind.charAt(0) + kind.slice(1).toLowerCase();
            return (
              <button
                key={eventType}
                onClick={() => {
                  setAttackForm(prev => ({ ...prev, kind }));
                  setOpenDialog('attack');
                }}
                type="button"
              >
                {label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setOpenDialog('damage');
            }}
            type="button"
          >
            Damage
          </button>
          <button
            onClick={() => {
              setOpenDialog('spell');
            }}
            type="button"
          >
            Spell cast
          </button>
          <span className="flex-grow" />
          <button onClick={onAdvanceRound} type="button">
            Advance round
          </button>
        </div>
      </div>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'attack'}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Record {attackForm.kind.charAt(0) + attackForm.kind.slice(1).toLowerCase()}</Dialog.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: 8 }}>
              <div className="field">
                <Label.Root className="field-label" htmlFor="attack-attacker">
                  Attacker
                </Label.Root>
                <select
                  className="field-input"
                  id="attack-attacker"
                  onChange={event => {
                    setAttackForm(prev => ({ ...prev, attackerId: event.target.value }));
                  }}
                  value={attackForm.attackerId}
                >
                  {combatantOptions}
                </select>
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="attack-target">
                  Target
                </Label.Root>
                <select
                  className="field-input"
                  id="attack-target"
                  onChange={event => {
                    setAttackForm(prev => ({ ...prev, targetId: event.target.value }));
                  }}
                  value={attackForm.targetId}
                >
                  {combatantOptions}
                </select>
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={closeDialog} type="button">
                Cancel
              </button>
              <button onClick={handleAttackSubmit} type="button">
                Record
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'damage'}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Record Damage</Dialog.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: 8 }}>
              <div className="field">
                <Label.Root className="field-label" htmlFor="damage-target">
                  Target
                </Label.Root>
                <select
                  className="field-input"
                  id="damage-target"
                  onChange={event => {
                    setDamageForm(prev => ({ ...prev, targetId: event.target.value }));
                  }}
                  value={damageForm.targetId}
                >
                  {combatantOptions}
                </select>
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="damage-source">
                  Source (optional)
                </Label.Root>
                <select
                  className="field-input"
                  id="damage-source"
                  onChange={event => {
                    setDamageForm(prev => ({ ...prev, sourceId: event.target.value }));
                  }}
                  value={damageForm.sourceId}
                >
                  <option value="">None</option>
                  {combatantOptions}
                </select>
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="damage-amount">
                  Amount
                </Label.Root>
                <input
                  className="field-input"
                  id="damage-amount"
                  min={0}
                  onChange={event => {
                    setDamageForm(prev => ({ ...prev, amount: Number(event.target.value) || 0 }));
                  }}
                  type="number"
                  value={damageForm.amount}
                />
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="damage-type">
                  Damage type
                </Label.Root>
                <select
                  className="field-input"
                  id="damage-type"
                  onChange={event => {
                    setDamageForm(prev => ({ ...prev, damageType: event.target.value }));
                  }}
                  value={damageForm.damageType}
                >
                  {DAMAGE_TYPES.map(damageType => (
                    <option key={damageType} value={damageType}>
                      {damageType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={closeDialog} type="button">
                Cancel
              </button>
              <button onClick={handleDamageSubmit} type="button">
                Record
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        open={openDialog === 'spell'}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="radix-overlay" />
          <Dialog.Content className="radix-dialog-content">
            <Dialog.Title>Record Spell Cast</Dialog.Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: 8 }}>
              <div className="field">
                <Label.Root className="field-label" htmlFor="spell-caster">
                  Caster
                </Label.Root>
                <select
                  className="field-input"
                  id="spell-caster"
                  onChange={event => {
                    setSpellForm(prev => ({ ...prev, casterId: event.target.value }));
                  }}
                  value={spellForm.casterId}
                >
                  {combatantOptions}
                </select>
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="spell-name">
                  Spell name
                </Label.Root>
                <input
                  className="field-input"
                  id="spell-name"
                  onChange={event => {
                    setSpellForm(prev => ({ ...prev, spellName: event.target.value }));
                  }}
                  value={spellForm.spellName}
                />
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="spell-targets">
                  Targets
                </Label.Root>
                <select
                  className="field-input"
                  id="spell-targets"
                  multiple
                  onChange={event => {
                    const selected = [...event.target.selectedOptions].map(option => option.value);
                    setSpellForm(prev => ({ ...prev, targetIds: selected }));
                  }}
                  value={spellForm.targetIds}
                >
                  {combatantOptions}
                </select>
              </div>
              <div className="field">
                <Label.Root className="field-label" htmlFor="spell-concentration">
                  Concentration
                </Label.Root>
                <select
                  className="field-input"
                  id="spell-concentration"
                  onChange={event => {
                    setSpellForm(prev => ({ ...prev, isConcentration: event.target.value === 'true' }));
                  }}
                  value={String(spellForm.isConcentration)}
                >
                  <option value="false">No</option>
                  <option value="true">Yes (caster will be marked concentrating)</option>
                </select>
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={closeDialog} type="button">
                Cancel
              </button>
              <button onClick={handleSpellSubmit} type="button">
                Record
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </article>
  );
};
