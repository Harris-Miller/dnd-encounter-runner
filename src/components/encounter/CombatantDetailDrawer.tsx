import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Cross, Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import type { Combatant } from '../../types/encounterState';

const chipClassForType = (type: Combatant['type']): string =>
  type === 'monster' ? 'chip chip-error' : 'chip chip-info';

const chipClassForModifier = (kind: 'immunity' | 'resistance' | 'vulnerability'): string => {
  if (kind === 'immunity') return 'chip chip-success';
  if (kind === 'resistance') return 'chip chip-info';
  return 'chip chip-warning';
};

export interface CombatantDetailDrawerProps {
  combatant: Combatant | null;
  onAdjustHp: (combatantId: string, delta: number) => void;
  onApplyEffect: (combatantId: string) => void;
  onClose: () => void;
  onMarkReactionUsed: (combatantId: string, used: boolean) => void;
  onRemoveCombatant: (combatantId: string) => void;
  onRemoveEffect: (combatantId: string, effectId: string) => void;
  onSetInitiative: (combatantId: string, initiative: number) => void;
}

export const CombatantDetailDrawer: FC<CombatantDetailDrawerProps> = ({
  combatant,
  onAdjustHp,
  onApplyEffect,
  onClose,
  onMarkReactionUsed,
  onRemoveCombatant,
  onRemoveEffect,
  onSetInitiative,
}) => {
  const [hpAdjust, setHpAdjust] = useState('5');
  const [initiativeDraft, setInitiativeDraft] = useState<string>('');

  const isOpen = combatant !== null;
  const hpPercent =
    combatant != null && combatant.maxHp > 0 ? Math.min(100, (combatant.currentHp / combatant.maxHp) * 100) : 0;

  const handleSetInitiative = () => {
    if (combatant == null) return;
    const parsed = Number(initiativeDraft);
    if (Number.isFinite(parsed)) {
      onSetInitiative(combatant.id, parsed);
      setInitiativeDraft('');
    }
  };

  return (
    <Dialog.Root
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={isOpen}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="radix-overlay" />
        <Dialog.Content className="radix-drawer-content">
          {combatant != null ? (
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className={chipClassForType(combatant.type)}>
                      {combatant.type === 'monster' ? 'Monster' : 'Player'}
                    </span>
                    <h2 style={{ flexGrow: 1, fontSize: '1.25rem', margin: 0 }}>{combatant.name}</h2>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => {
                            onRemoveCombatant(combatant.id);
                            onClose();
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                          type="button"
                        >
                          <Trash2 color="var(--color-error)" size={20} />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content className="radix-tooltip-content" sideOffset={4}>
                          Remove combatant
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>AC {combatant.armorClass}</span>
                    <span>Initiative {combatant.initiative ?? '—'}</span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Hit points</h3>
                  <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Cross color="var(--color-error)" size={16} />
                    <span>
                      {String(combatant.currentHp)} / {String(combatant.maxHp)}
                    </span>
                    <div className="progress-bar" style={{ flexGrow: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${String(hpPercent)}%` }} />
                    </div>
                  </div>
                  <div style={{ alignItems: 'flex-end', display: 'flex', gap: '0.5rem' }}>
                    <div className="field" style={{ width: 100 }}>
                      <Label.Root className="field-label" htmlFor="hp-adjust-amount">
                        Amount
                      </Label.Root>
                      <input
                        className="field-input"
                        id="hp-adjust-amount"
                        onChange={event => {
                          setHpAdjust(event.target.value);
                        }}
                        type="number"
                        value={hpAdjust}
                      />
                    </div>
                    <button
                      onClick={() => {
                        onAdjustHp(combatant.id, -Math.abs(Number(hpAdjust) || 0));
                      }}
                      style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
                      type="button"
                    >
                      <Minus size={18} />
                      Damage
                    </button>
                    <button
                      onClick={() => {
                        onAdjustHp(combatant.id, Math.abs(Number(hpAdjust) || 0));
                      }}
                      style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
                      type="button"
                    >
                      <Heart size={18} />
                      Heal
                    </button>
                  </div>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--color-divider)', margin: 0 }} />

                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Initiative</h3>
                  <div style={{ alignItems: 'flex-end', display: 'flex', gap: '0.5rem' }}>
                    <div className="field" style={{ width: 120 }}>
                      <Label.Root className="field-label" htmlFor="initiative-roll">
                        Roll
                      </Label.Root>
                      <input
                        className="field-input"
                        id="initiative-roll"
                        onChange={event => {
                          setInitiativeDraft(event.target.value);
                        }}
                        type="number"
                        value={initiativeDraft}
                      />
                    </div>
                    <button onClick={handleSetInitiative} type="button">
                      Set
                    </button>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Reaction</h3>
                  <ToggleGroup.Root
                    aria-label="Reaction status"
                    className="radix-toggle-group"
                    onValueChange={value => {
                      if (value === 'available' || value === 'used') {
                        onMarkReactionUsed(combatant.id, value === 'used');
                      }
                    }}
                    type="single"
                    value={combatant.actionEconomy.reactionUsed ? 'used' : 'available'}
                  >
                    <ToggleGroup.Item className="radix-toggle-item" value="available">
                      Available
                    </ToggleGroup.Item>
                    <ToggleGroup.Item className="radix-toggle-item" value="used">
                      Used
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--color-divider)', margin: 0 }} />

                <div>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Active effects</h3>
                    <button
                      onClick={() => {
                        onApplyEffect(combatant.id);
                      }}
                      style={{ alignItems: 'center', display: 'inline-flex', gap: '0.5rem' }}
                      type="button"
                    >
                      <Plus size={18} />
                      Apply
                    </button>
                  </div>
                  {combatant.effects.length === 0 ? (
                    <p className="text-secondary" style={{ margin: 0 }}>
                      No active effects.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {combatant.effects.map(effect => (
                        <div
                          key={effect.id}
                          style={{
                            alignItems: 'center',
                            border: '1px solid var(--color-divider)',
                            borderRadius: 8,
                            display: 'flex',
                            gap: 8,
                            padding: 8,
                          }}
                        >
                          <div style={{ flexGrow: 1 }}>
                            <p style={{ margin: '0 0 0.25rem' }}>{effect.name}</p>
                            <p className="text-secondary" style={{ fontSize: '0.75rem', margin: 0 }}>
                              {effect.description}
                              {effect.remainingRounds != null
                                ? ` · ${String(effect.remainingRounds)} round(s) left`
                                : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              onRemoveEffect(combatant.id, effect.id);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--color-divider)', margin: 0 }} />

                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Damage modifiers</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {combatant.damageImmunities.map(immunity => (
                      <span className={chipClassForModifier('immunity')} key={`immune-${immunity}`}>
                        {`Immune: ${immunity}`}
                      </span>
                    ))}
                    {combatant.damageResistances.map(resistance => (
                      <span className={chipClassForModifier('resistance')} key={`resist-${resistance}`}>
                        {`Resist: ${resistance}`}
                      </span>
                    ))}
                    {combatant.damageVulnerabilities.map(vulnerability => (
                      <span className={chipClassForModifier('vulnerability')} key={`vuln-${vulnerability}`}>
                        {`Vulnerable: ${vulnerability}`}
                      </span>
                    ))}
                    {combatant.damageImmunities.length === 0 &&
                      combatant.damageResistances.length === 0 &&
                      combatant.damageVulnerabilities.length === 0 && (
                        <p className="text-secondary" style={{ margin: 0 }}>
                          No baseline modifiers.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
