// D&D 5e/2024 Data Types
// Based on D&D 5e API structure

export interface ApiReference {
  index: string;
  name: string;
  url: string;
}

export interface AbilityScore {
  name: string;
  url: string;
}

export interface Skill {
  ability_score: ApiReference;
  desc?: string[];
  index: string;
  name: string;
  url: string;
}

export interface Spell {
  attack_type?: string;
  casting_time?: string;
  classes?: ApiReference[];
  components?: string[];
  concentration?: boolean;
  damage?: {
    damage_at_slot_level?: Record<string, string>;
    damage_type?: ApiReference;
  };
  desc?: string[];
  duration?: string;
  higher_level?: string[];
  index: string;
  level?: number;
  material?: string;
  name: string;
  range?: string;
  ritual?: boolean;
  school?: ApiReference;
  subclasses?: ApiReference[];
  url: string;
}

export interface Class {
  class_levels?: string;
  hit_die?: number;
  index: string;
  multi_classing?: {
    prerequisites?: {
      ability_score: ApiReference;
      minimum_score: number;
    }[];
    proficiencies_gained?: ApiReference[];
  };
  name: string;
  proficiencies?: ApiReference[];
  proficiency_choices?: {
    choose: number;
    from: {
      option_set_type: string;
      options: {
        item: ApiReference;
        option_type: string;
      }[];
    };
    type: string;
  }[];
  saving_throws?: ApiReference[];
  spellcasting?: {
    cantrips_known?: Record<string, number>;
    level?: number;
    spell_slots_by_level?: Record<string, Record<string, number>>;
    spells_known?: Record<string, number>;
  };
  starting_equipment?: {
    equipment: ApiReference;
    quantity?: number;
  }[];
  starting_equipment_options?: {
    choose: number;
    from: {
      option_set_type: string;
      options: {
        item: ApiReference;
        option_type: string;
      }[];
    };
    type: string;
  }[];
  subclasses?: ApiReference[];
  url: string;
}

export interface Race {
  ability_bonuses?: {
    ability_score: ApiReference;
    bonus: number;
  }[];
  age?: string;
  alignment?: string;
  index: string;
  language_desc?: string;
  languages?: ApiReference[];
  name: string;
  size?: string;
  size_description?: string;
  speed?: number;
  starting_proficiencies?: ApiReference[];
  subraces?: ApiReference[];
  traits?: ApiReference[];
  url: string;
}

export interface Background {
  feature?: {
    desc: string[];
    name: string;
  };
  index: string;
  language_options?: {
    choose: number;
    from: {
      option_set_type: string;
      options: {
        item: ApiReference;
        option_type: string;
      }[];
    };
    type: string;
  };
  name: string;
  personality_traits?: {
    choose: number;
    from: {
      option_set_type: string;
      options: {
        option_type: string;
        string: string;
      }[];
    };
    type: string;
  };
  starting_equipment?: {
    equipment: ApiReference;
    quantity?: number;
  }[];
  starting_proficiencies?: ApiReference[];
  url: string;
}

export interface Monster {
  actions?: {
    attack_bonus?: number;
    damage?: {
      damage_dice: string;
      damage_type: ApiReference;
    }[];
    dc?: {
      dc_type: ApiReference;
      dc_value: number;
      success_type: string;
    };
    desc: string;
    name: string;
  }[];
  alignment?: string;
  armor_class?: {
    desc?: string;
    type: string;
    value: number;
  }[];
  challenge_rating?: number;
  charisma?: number;
  condition_immunities?: ApiReference[];
  constitution?: number;
  damage_immunities?: string[];
  damage_resistances?: string[];
  damage_vulnerabilities?: string[];
  dexterity?: number;
  hit_dice?: string;
  hit_points?: number;
  index: string;
  intelligence?: number;
  languages?: string;
  legendary_actions?: {
    attack_bonus?: number;
    damage?: {
      damage_dice: string;
      damage_type: ApiReference;
    }[];
    desc: string;
    name: string;
  }[];
  name: string;
  proficiencies?: {
    proficiency: ApiReference;
    value?: number;
  }[];
  senses?: {
    blindsight?: string;
    darkvision?: string;
    tremorsense?: string;
    truesight?: string;
  };
  size?: string;
  special_abilities?: {
    desc: string;
    name: string;
    usage?: {
      rest_types?: string[];
      times?: number;
      type: string;
    };
  }[];
  strength?: number;
  subtype?: string;
  type?: string;
  url: string;
  wisdom?: number;
  xp?: number;
}

export interface Equipment {
  armor_category?: string;
  armor_class?: {
    base: number;
    dex_bonus: boolean;
    max_bonus?: number;
  };
  category_range?: string;
  contents?: ApiReference[];
  cost?: {
    quantity: number;
    unit: string;
  };
  damage?: {
    damage_dice: string;
    damage_type: ApiReference;
  };
  desc?: string[];
  equipment_category?: ApiReference;
  gear_category?: ApiReference;
  index: string;
  name: string;
  properties?: ApiReference[];
  range?: {
    long?: number;
    normal?: number;
  };
  special?: string[];
  stealth_disadvantage?: boolean;
  str_minimum?: number;
  throw_range?: {
    long?: number;
    normal?: number;
  };
  two_handed_damage?: {
    damage_dice: string;
    damage_type: ApiReference;
  };
  url: string;
  weapon_category?: string;
  weapon_range?: string;
  weight?: number;
}

export interface ApiListResponse<T> {
  count: number;
  results: T[];
}
