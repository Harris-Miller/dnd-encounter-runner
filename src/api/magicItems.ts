import { queryOptions } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import type { Database } from '../types/database.gen';

export type MagicItemRow = Database['public']['Tables']['magic_items']['Row'];

export interface MagicItemSummary {
  id: string;
  isCursed: boolean;
  magicItemCategory: string;
  magicItemRarityId: string;
  name: string;
  requiresAttunement: boolean;
}

export interface MagicItemDetail extends MagicItemSummary {
  categorySpecifierText: null | string;
  ddbId: null | string;
  description: null | string;
  isConsumable: boolean;
  slug: null | string;
}

const rowToSummary = (row: MagicItemRow): MagicItemSummary => ({
  id: row.id,
  isCursed: row.is_cursed,
  magicItemCategory: row.magic_item_category,
  magicItemRarityId: row.magic_item_rarity_id,
  name: row.name,
  requiresAttunement: row.requires_attunement,
});

const rowToDetail = (row: MagicItemRow): MagicItemDetail => ({
  ...rowToSummary(row),
  categorySpecifierText: row.category_specifier_text,
  ddbId: row.ddb_id,
  description: row.description_text,
  isConsumable: row.is_consumable,
  slug: row.slug,
});

const PAGE_SIZE = 25;

const searchMagicItems = async (search: string): Promise<MagicItemSummary[]> => {
  const trimmed = search.trim();
  const query = supabase.from('magic_items').select('*').order('name', { ascending: true }).limit(PAGE_SIZE);

  const { data, error } = trimmed === '' ? await query : await query.ilike('name', `%${trimmed}%`);

  if (error != null) {
    throw error;
  }

  return data.map(rowToSummary);
};

const fetchMagicItem = async (magicItemId: string): Promise<MagicItemDetail> => {
  const { data, error } = await supabase.from('magic_items').select('*').eq('id', magicItemId).single();

  if (error != null) {
    throw error;
  }

  return rowToDetail(data);
};

export const queryMagicItemsSearch = (search: string) =>
  queryOptions({
    queryFn: () => searchMagicItems(search),
    queryKey: ['magicItems', 'search', search] as const,
  });

export const queryMagicItem = (magicItemId: string) =>
  queryOptions({
    queryFn: () => fetchMagicItem(magicItemId),
    queryKey: ['magicItems', 'detail', magicItemId] as const,
  });
