import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const weaponsRelations = defineRelationsPart(schema, r => ({
  weaponProperties: {
    weapons: r.many.weapons(),
  },
  weapons: {
    // TODO
    // damageType: r.one.damageTypes({
    //   from: r.weapons.damageTypeId,
    //   to: r.damageTypes.id,
    // }),
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
