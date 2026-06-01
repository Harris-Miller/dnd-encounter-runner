import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Progress,
  SegmentedControl,
  Separator,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { Cross, Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FC } from 'react';

import type { Combatant } from '../../types/encounterState';

const typeBadgeColor = (type: Combatant['type']): 'blue' | 'red' => (type === 'monster' ? 'red' : 'blue');

const modifierBadgeColor = (kind: 'immunity' | 'resistance' | 'vulnerability'): 'blue' | 'green' | 'orange' => {
  if (kind === 'immunity') return 'green';
  if (kind === 'resistance') return 'blue';
  return 'orange';
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
      <Dialog.Content className="dialog-drawer">
        {combatant != null ? (
          <Box p="5">
            <Flex direction="column" gap="5">
              <Box>
                <Flex align="center" gap="2" mb="2">
                  <Badge color={typeBadgeColor(combatant.type)} variant="soft">
                    {combatant.type === 'monster' ? 'Monster' : 'Player'}
                  </Badge>
                  <Heading size="5" style={{ flexGrow: 1, margin: 0 }}>
                    {combatant.name}
                  </Heading>
                  <Tooltip content="Remove combatant">
                    <IconButton
                      color="red"
                      onClick={() => {
                        onRemoveCombatant(combatant.id);
                        onClose();
                      }}
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Tooltip>
                </Flex>
                <Flex gap="4">
                  <Text size="2">AC {combatant.armorClass}</Text>
                  <Text size="2">Initiative {combatant.initiative ?? '—'}</Text>
                </Flex>
              </Box>

              <Box>
                <Heading mb="2" size="2">
                  Hit points
                </Heading>
                <Flex align="center" gap="2" mb="2">
                  <Cross color="var(--red-9)" size={16} />
                  <Text size="2">
                    {String(combatant.currentHp)} / {String(combatant.maxHp)}
                  </Text>
                  <Progress style={{ flexGrow: 1 }} value={hpPercent} />
                </Flex>
                <Flex align="end" gap="2">
                  <Flex direction="column" gap="1" style={{ width: 100 }}>
                    <Text as="label" htmlFor="hp-adjust-amount" size="1" weight="medium">
                      Amount
                    </Text>
                    <TextField.Root
                      id="hp-adjust-amount"
                      onChange={event => {
                        setHpAdjust(event.target.value);
                      }}
                      type="number"
                      value={hpAdjust}
                    />
                  </Flex>
                  <Button
                    color="red"
                    onClick={() => {
                      onAdjustHp(combatant.id, -Math.abs(Number(hpAdjust) || 0));
                    }}
                    type="button"
                    variant="soft"
                  >
                    <Minus size={18} />
                    Damage
                  </Button>
                  <Button
                    color="green"
                    onClick={() => {
                      onAdjustHp(combatant.id, Math.abs(Number(hpAdjust) || 0));
                    }}
                    type="button"
                    variant="soft"
                  >
                    <Heart size={18} />
                    Heal
                  </Button>
                </Flex>
              </Box>

              <Separator size="4" />

              <Box>
                <Heading mb="2" size="2">
                  Initiative
                </Heading>
                <Flex align="end" gap="2">
                  <Flex direction="column" gap="1" style={{ width: 120 }}>
                    <Text as="label" htmlFor="initiative-roll" size="1" weight="medium">
                      Roll
                    </Text>
                    <TextField.Root
                      id="initiative-roll"
                      onChange={event => {
                        setInitiativeDraft(event.target.value);
                      }}
                      type="number"
                      value={initiativeDraft}
                    />
                  </Flex>
                  <Button onClick={handleSetInitiative} type="button">
                    Set
                  </Button>
                </Flex>
              </Box>

              <Box>
                <Heading mb="2" size="2">
                  Reaction
                </Heading>
                <SegmentedControl.Root
                  onValueChange={value => {
                    if (value === 'available' || value === 'used') {
                      onMarkReactionUsed(combatant.id, value === 'used');
                    }
                  }}
                  value={combatant.actionEconomy.reactionUsed ? 'used' : 'available'}
                >
                  <SegmentedControl.Item value="available">Available</SegmentedControl.Item>
                  <SegmentedControl.Item value="used">Used</SegmentedControl.Item>
                </SegmentedControl.Root>
              </Box>

              <Separator size="4" />

              <Box>
                <Flex align="center" justify="between" mb="2">
                  <Heading size="2">Active effects</Heading>
                  <Button
                    onClick={() => {
                      onApplyEffect(combatant.id);
                    }}
                    type="button"
                    variant="soft"
                  >
                    <Plus size={18} />
                    Apply
                  </Button>
                </Flex>
                {combatant.effects.length === 0 ? (
                  <Text color="gray" size="2">
                    No active effects.
                  </Text>
                ) : (
                  <Flex direction="column" gap="2">
                    {combatant.effects.map(effect => (
                      <Card key={effect.id} variant="surface">
                        <Flex align="center" gap="2" p="2">
                          <Flex direction="column" flexGrow="1" gap="1">
                            <Text size="2" weight="medium">
                              {effect.name}
                            </Text>
                            <Text color="gray" size="1">
                              {effect.description}
                              {effect.remainingRounds != null
                                ? ` · ${String(effect.remainingRounds)} round(s) left`
                                : ''}
                            </Text>
                          </Flex>
                          <IconButton
                            color="gray"
                            onClick={() => {
                              onRemoveEffect(combatant.id, effect.id);
                            }}
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                )}
              </Box>

              <Separator size="4" />

              <Box>
                <Heading mb="2" size="2">
                  Damage modifiers
                </Heading>
                <Flex gap="1" wrap="wrap">
                  {combatant.damageImmunities.map(immunity => (
                    <Badge color={modifierBadgeColor('immunity')} key={`immune-${immunity}`} variant="soft">
                      {`Immune: ${immunity}`}
                    </Badge>
                  ))}
                  {combatant.damageResistances.map(resistance => (
                    <Badge color={modifierBadgeColor('resistance')} key={`resist-${resistance}`} variant="soft">
                      {`Resist: ${resistance}`}
                    </Badge>
                  ))}
                  {combatant.damageVulnerabilities.map(vulnerability => (
                    <Badge color={modifierBadgeColor('vulnerability')} key={`vuln-${vulnerability}`} variant="soft">
                      {`Vulnerable: ${vulnerability}`}
                    </Badge>
                  ))}
                  {combatant.damageImmunities.length === 0 &&
                    combatant.damageResistances.length === 0 &&
                    combatant.damageVulnerabilities.length === 0 && (
                      <Text color="gray" size="2">
                        No baseline modifiers.
                      </Text>
                    )}
                </Flex>
              </Box>
            </Flex>
          </Box>
        ) : null}
      </Dialog.Content>
    </Dialog.Root>
  );
};
