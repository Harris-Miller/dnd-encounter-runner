import { defineRelations } from 'drizzle-orm';

import * as schemaTables from './schema.ts';
import { users } from './transient/auth.ts';

const schema = { ...schemaTables, users };

export const relations = defineRelations(schema, r => ({
  campaigns: {
    characters: r.many.characters(),
    encounters: r.many.encounters(),
    profile: r.one.profiles({
      from: r.campaigns.profileId,
      to: r.profiles.id,
    }),
  },
  characters: {
    campaign: r.one.campaigns({
      from: r.characters.campaignId,
      to: r.campaigns.id,
    }),
    profile: r.one.profiles({
      from: r.characters.profileId,
      to: r.profiles.id,
    }),
  },
  encounters: {
    campaign: r.one.campaigns({
      from: r.encounters.campaignId,
      to: r.campaigns.id,
    }),
    profile: r.one.profiles({
      from: r.encounters.profileId,
      to: r.profiles.id,
    }),
  },
  mastery: {
    weapons: r.many.weapons(),
  },
  profiles: {
    campaigns: r.many.campaigns(),
    characters: r.many.characters(),
    encounters: r.many.encounters(),
    user: r.one.users({
      from: r.profiles.userId,
      to: r.users.id,
    }),
  },
  weaponProperties: {
    weapons: r.many.weapons(),
  },
  weapons: {
    mastery: r.one.mastery({
      from: r.weapons.masteryId,
      to: r.mastery.id,
    }),
    weaponProperties: r.many.weaponProperties({
      from: r.weapons.id.through(r.weaponToWeaponProperties.weaponId),
      to: r.weaponProperties.id.through(r.weaponToWeaponProperties.weaponPropertyId),
    }),
  },
}));

// export const relations = defineRelations(schema, r => ({
//   armor: {
//     magicItems: r.many.magicItems(),
//   },
//   castingTimes: {
//     spells: r.many.spells(),
//   },
//   conditions: {
//     monsterConditionImmunities: r.many.monsterConditionImmunities(),
//   },
//   creatureTypes: {
//     monsters: r.many.monsters(),
//   },
//   damageTypes: {
//     magicItemDamageResistances: r.many.magicItemDamageResistances(),
//     magicItemDamageVulnerabilities: r.many.magicItemDamageVulnerabilities(),
//     monsterDamageImmunities: r.many.monsterDamageImmunities(),
//     monsterDamageResistances: r.many.monsterDamageResistances(),
//     monsterDamageVulnerabilities: r.many.monsterDamageVulnerabilities(),
//     spellDamageTypes: r.many.spellDamageTypes(),
//   },
//   descriptiveTags: {
//     monsterDescriptiveTags: r.many.monsterDescriptiveTags(),
//   },
//   durations: {
//     spells: r.many.spells(),
//   },
//   encounters: {
//     user: r.one.users({
//       from: r.encounters.userId,
//       to: r.users.id,
//     }),
//   },
//   magicItemCategories: {
//     magicItemCraftingTools: r.many.magicItemCraftingTools(),
//     magicItems: r.many.magicItems(),
//   },
//   magicItemCharges: {
//     magicItem: r.one.magicItems({
//       from: r.magicItemCharges.magicItemId,
//       to: r.magicItems.id,
//     }),
//   },
//   magicItemCraftingTools: {
//     magicItemCategory: r.one.magicItemCategories({
//       from: r.magicItemCraftingTools.magicItemCategoryId,
//       to: r.magicItemCategories.id,
//     }),
//     tool: r.one.tools({
//       from: r.magicItemCraftingTools.toolId,
//       to: r.tools.id,
//     }),
//   },
//   magicItemDamageResistances: {
//     damageType: r.one.damageTypes({
//       from: r.magicItemDamageResistances.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     magicItem: r.one.magicItems({
//       from: r.magicItemDamageResistances.magicItemId,
//       to: r.magicItems.id,
//     }),
//   },
//   magicItemDamageVulnerabilities: {
//     damageType: r.one.damageTypes({
//       from: r.magicItemDamageVulnerabilities.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     magicItem: r.one.magicItems({
//       from: r.magicItemDamageVulnerabilities.magicItemId,
//       to: r.magicItems.id,
//     }),
//   },
//   magicItemRarities: {
//     magicItems: r.many.magicItems(),
//   },
//   magicItemSpells: {
//     magicItem: r.one.magicItems({
//       from: r.magicItemSpells.magicItemId,
//       to: r.magicItems.id,
//     }),
//     spell: r.one.spells({
//       from: r.magicItemSpells.spellId,
//       to: r.spells.id,
//     }),
//   },
//   magicItems: {
//     baseArmor: r.one.armor({
//       from: r.magicItems.baseArmorId,
//       to: r.armor.id,
//     }),
//     baseWeapon: r.one.weapons({
//       from: r.magicItems.baseWeaponId,
//       to: r.weapons.id,
//     }),
//     magicItemCategory: r.one.magicItemCategories({
//       from: r.magicItems.magicItemCategoryId,
//       to: r.magicItemCategories.id,
//     }),
//     magicItemCharges: r.one.magicItemCharges(),
//     magicItemDamageResistances: r.many.magicItemDamageResistances(),
//     magicItemDamageVulnerabilities: r.many.magicItemDamageVulnerabilities(),
//     magicItemRarity: r.one.magicItemRarities({
//       from: r.magicItems.magicItemRarityId,
//       to: r.magicItemRarities.id,
//     }),
//     magicItemSpells: r.many.magicItemSpells(),
//     sentientMagicItems: r.one.sentientMagicItems(),
//   },
//   monsterActions: {
//     monster: r.one.monsters({
//       from: r.monsterActions.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterConditionImmunities: {
//     condition: r.one.conditions({
//       from: r.monsterConditionImmunities.conditionId,
//       to: r.conditions.id,
//     }),
//     monster: r.one.monsters({
//       from: r.monsterConditionImmunities.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterDamageImmunities: {
//     damageType: r.one.damageTypes({
//       from: r.monsterDamageImmunities.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     monster: r.one.monsters({
//       from: r.monsterDamageImmunities.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterDamageResistances: {
//     damageType: r.one.damageTypes({
//       from: r.monsterDamageResistances.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     monster: r.one.monsters({
//       from: r.monsterDamageResistances.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterDamageVulnerabilities: {
//     damageType: r.one.damageTypes({
//       from: r.monsterDamageVulnerabilities.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     monster: r.one.monsters({
//       from: r.monsterDamageVulnerabilities.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterDescriptiveTags: {
//     descriptiveTag: r.one.descriptiveTags({
//       from: r.monsterDescriptiveTags.descriptiveTagId,
//       to: r.descriptiveTags.id,
//     }),
//     monster: r.one.monsters({
//       from: r.monsterDescriptiveTags.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterSpeeds: {
//     monster: r.one.monsters({
//       from: r.monsterSpeeds.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterSpellcasting: {
//     monster: r.one.monsters({
//       from: r.monsterSpellcasting.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsterSpells: {
//     monster: r.one.monsters({
//       from: r.monsterSpells.monsterId,
//       to: r.monsters.id,
//     }),
//     spell: r.one.spells({
//       from: r.monsterSpells.spellId,
//       to: r.spells.id,
//     }),
//   },
//   monsterTraits: {
//     monster: r.one.monsters({
//       from: r.monsterTraits.monsterId,
//       to: r.monsters.id,
//     }),
//   },
//   monsters: {
//     monsterActions: r.many.monsterActions(),
//     monsterConditionImmunities: r.many.monsterConditionImmunities(),
//     monsterDamageImmunities: r.many.monsterDamageImmunities(),
//     monsterDamageResistances: r.many.monsterDamageResistances(),
//     monsterDamageVulnerabilities: r.many.monsterDamageVulnerabilities(),
//     monsterDescriptiveTags: r.many.monsterDescriptiveTags(),
//     monsterSpeeds: r.many.monsterSpeeds(),
//     monsterSpellcasting: r.one.monsterSpellcasting(),
//     monsterSpells: r.many.monsterSpells(),
//     monsterTraits: r.many.monsterTraits(),
//   },
//   sentientMagicItems: {
//     magicItem: r.one.magicItems({
//       from: r.sentientMagicItems.magicItemId,
//       to: r.magicItems.id,
//     }),
//   },
//   sizes: {
//     monsters: r.many.monsters(),
//   },
//   spellDamageTypes: {
//     damageType: r.one.damageTypes({
//       from: r.spellDamageTypes.damageTypeId,
//       to: r.damageTypes.id,
//     }),
//     spell: r.one.spells({
//       from: r.spellDamageTypes.spellId,
//       to: r.spells.id,
//     }),
//   },
//   spells: {
//     magicItemSpells: r.many.magicItemSpells(),
//     monsterSpells: r.many.monsterSpells(),
//     spellDamageTypes: r.many.spellDamageTypes(),
//   },
//   tools: {
//     magicItemCraftingTools: r.many.magicItemCraftingTools(),
//   },
//   users: {
//     encounters: r.many.encounters(),
//   },
//   weapons: {
//     magicItems: r.many.magicItems(),
//   },
// }));
