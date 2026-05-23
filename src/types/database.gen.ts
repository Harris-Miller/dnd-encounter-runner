export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      damage_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      encounters: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encounters_profile_id_profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      magic_items: {
        Row: {
          category_specifier_text: string | null
          created_at: string | null
          ddb_id: string | null
          description_text: string | null
          id: string
          is_consumable: boolean
          is_cursed: boolean
          magic_item_category: string
          magic_item_rarity_id: string
          name: string
          requires_attunement: boolean
          slug: string | null
          updated_at: string | null
          variant_rarities:
            | Database["public"]["Enums"]["magic_item_variant_rarity"][]
            | null
        }
        Insert: {
          category_specifier_text?: string | null
          created_at?: string | null
          ddb_id?: string | null
          description_text?: string | null
          id?: string
          is_consumable: boolean
          is_cursed: boolean
          magic_item_category: string
          magic_item_rarity_id: string
          name: string
          requires_attunement: boolean
          slug?: string | null
          updated_at?: string | null
          variant_rarities?:
            | Database["public"]["Enums"]["magic_item_variant_rarity"][]
            | null
        }
        Update: {
          category_specifier_text?: string | null
          created_at?: string | null
          ddb_id?: string | null
          description_text?: string | null
          id?: string
          is_consumable?: boolean
          is_cursed?: boolean
          magic_item_category?: string
          magic_item_rarity_id?: string
          name?: string
          requires_attunement?: boolean
          slug?: string | null
          updated_at?: string | null
          variant_rarities?:
            | Database["public"]["Enums"]["magic_item_variant_rarity"][]
            | null
        }
        Relationships: []
      }
      mastery: {
        Row: {
          created_at: string | null
          description: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      monsters: {
        Row: {
          actions: string[]
          alignment: string
          armor_class: number
          bonus_actions: string[]
          challenge_rating: string
          charisma: number
          charisma_save: number
          constitution: number
          constitution_save: number
          created_at: string | null
          creature_type: string
          descriptive_tags: string | null
          dexterity: number
          dexterity_save: number
          experience_points: number | null
          experience_points_alt: string | null
          gear: string | null
          hit_point_dice: string
          hit_points: number
          id: string
          immunities: string[]
          initiative_modifier: string
          initiative_score: number
          intelligence: number
          intelligence_save: number
          languages: string
          legendary_actions: string[]
          name: string
          proficiency_bonus: number
          reactions: string[]
          resistances: string[]
          senses: string[]
          size: string
          skills: string[]
          speed: string
          speed_burrow: string | null
          speed_climb: string | null
          speed_fly: string | null
          speed_swim: string | null
          strength: number
          strength_save: number
          traits: string[]
          updated_at: string | null
          vulnerabilities: string | null
          wisdom: number
          wisdom_save: number
        }
        Insert: {
          actions?: string[]
          alignment: string
          armor_class: number
          bonus_actions?: string[]
          challenge_rating: string
          charisma: number
          charisma_save: number
          constitution: number
          constitution_save: number
          created_at?: string | null
          creature_type: string
          descriptive_tags?: string | null
          dexterity: number
          dexterity_save: number
          experience_points?: number | null
          experience_points_alt?: string | null
          gear?: string | null
          hit_point_dice: string
          hit_points: number
          id?: string
          immunities?: string[]
          initiative_modifier: string
          initiative_score: number
          intelligence: number
          intelligence_save: number
          languages: string
          legendary_actions?: string[]
          name: string
          proficiency_bonus: number
          reactions?: string[]
          resistances?: string[]
          senses?: string[]
          size: string
          skills?: string[]
          speed: string
          speed_burrow?: string | null
          speed_climb?: string | null
          speed_fly?: string | null
          speed_swim?: string | null
          strength: number
          strength_save: number
          traits?: string[]
          updated_at?: string | null
          vulnerabilities?: string | null
          wisdom: number
          wisdom_save: number
        }
        Update: {
          actions?: string[]
          alignment?: string
          armor_class?: number
          bonus_actions?: string[]
          challenge_rating?: string
          charisma?: number
          charisma_save?: number
          constitution?: number
          constitution_save?: number
          created_at?: string | null
          creature_type?: string
          descriptive_tags?: string | null
          dexterity?: number
          dexterity_save?: number
          experience_points?: number | null
          experience_points_alt?: string | null
          gear?: string | null
          hit_point_dice?: string
          hit_points?: number
          id?: string
          immunities?: string[]
          initiative_modifier?: string
          initiative_score?: number
          intelligence?: number
          intelligence_save?: number
          languages?: string
          legendary_actions?: string[]
          name?: string
          proficiency_bonus?: number
          reactions?: string[]
          resistances?: string[]
          senses?: string[]
          size?: string
          skills?: string[]
          speed?: string
          speed_burrow?: string | null
          speed_climb?: string | null
          speed_fly?: string | null
          speed_swim?: string | null
          strength?: number
          strength_save?: number
          traits?: string[]
          updated_at?: string | null
          vulnerabilities?: string | null
          wisdom?: number
          wisdom_save?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_source: Database["public"]["Enums"]["profile_avatar_source"]
          created_at: string | null
          email: string
          gravatar_id: string | null
          id: string
          name: string | null
          updated_at: string | null
          uploaded_avatar_id: string | null
          user_id: string
        }
        Insert: {
          avatar_source?: Database["public"]["Enums"]["profile_avatar_source"]
          created_at?: string | null
          email: string
          gravatar_id?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          uploaded_avatar_id?: string | null
          user_id: string
        }
        Update: {
          avatar_source?: Database["public"]["Enums"]["profile_avatar_source"]
          created_at?: string | null
          email?: string
          gravatar_id?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          uploaded_avatar_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spells: {
        Row: {
          casting_time: string
          created_at: string | null
          description: string | null
          duration: string
          id: string
          is_concentration: boolean
          is_material: boolean
          is_ritual: boolean
          is_somatic: boolean
          is_verbal: boolean
          level: number
          material_description: string | null
          name: string
          range: string
          school: string
          upcast_description: string | null
          updated_at: string | null
        }
        Insert: {
          casting_time: string
          created_at?: string | null
          description?: string | null
          duration: string
          id?: string
          is_concentration: boolean
          is_material: boolean
          is_ritual: boolean
          is_somatic: boolean
          is_verbal: boolean
          level: number
          material_description?: string | null
          name: string
          range: string
          school: string
          upcast_description?: string | null
          updated_at?: string | null
        }
        Update: {
          casting_time?: string
          created_at?: string | null
          description?: string | null
          duration?: string
          id?: string
          is_concentration?: boolean
          is_material?: boolean
          is_ritual?: boolean
          is_somatic?: boolean
          is_verbal?: boolean
          level?: number
          material_description?: string | null
          name?: string
          range?: string
          school?: string
          upcast_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weapon_properties: {
        Row: {
          created_at: string | null
          id: string
          name: string
          range_long: number | null
          range_short: number | null
          updated_at: string | null
          versatile_damage_die: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          range_long?: number | null
          range_short?: number | null
          updated_at?: string | null
          versatile_damage_die?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          range_long?: number | null
          range_short?: number | null
          updated_at?: string | null
          versatile_damage_die?: string | null
        }
        Relationships: []
      }
      weapon_to_weapon_properties: {
        Row: {
          created_at: string | null
          updated_at: string | null
          weapon_id: string
          weapon_property_id: string
        }
        Insert: {
          created_at?: string | null
          updated_at?: string | null
          weapon_id: string
          weapon_property_id: string
        }
        Update: {
          created_at?: string | null
          updated_at?: string | null
          weapon_id?: string
          weapon_property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapon_to_weapon_properties_L1T3dSQbrwct_fkey"
            columns: ["weapon_property_id"]
            isOneToOne: false
            referencedRelation: "weapon_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weapon_to_weapon_properties_weapon_id_weapons_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      weapons: {
        Row: {
          category: string
          classification: string
          created_at: string | null
          id: string
          mastery_id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          classification: string
          created_at?: string | null
          id?: string
          mastery_id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          classification?: string
          created_at?: string | null
          id?: string
          mastery_id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weapons_mastery_id_mastery_id_fkey"
            columns: ["mastery_id"]
            isOneToOne: false
            referencedRelation: "mastery"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      magic_item_variant_rarity:
        | "Artifact"
        | "Legendary"
        | "Rare"
        | "Uncommon"
        | "Very Rare"
      profile_avatar_source: "oauth" | "uploaded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      magic_item_variant_rarity: [
        "Artifact",
        "Legendary",
        "Rare",
        "Uncommon",
        "Very Rare",
      ],
      profile_avatar_source: ["oauth", "uploaded"],
    },
  },
} as const

