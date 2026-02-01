import type { ApiListResponse, ApiReference, Background, Class, Equipment, Monster, Race, Spell } from '../types/dnd';

const API_BASE_URL = 'https://www.dnd5eapi.co/api';

const fetchJson = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
};

// Spells
export const getSpells = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/spells');
};

export const getSpell = async (index: string): Promise<Spell> => {
  return fetchJson<Spell>(`/spells/${index}`);
};

// Classes
export const getClasses = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/classes');
};

export const getClass = async (index: string): Promise<Class> => {
  return fetchJson<Class>(`/classes/${index}`);
};

// Races
export const getRaces = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/races');
};

export const getRace = async (index: string): Promise<Race> => {
  return fetchJson<Race>(`/races/${index}`);
};

// Backgrounds
export const getBackgrounds = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/backgrounds');
};

export const getBackground = async (index: string): Promise<Background> => {
  return fetchJson<Background>(`/backgrounds/${index}`);
};

// Monsters
export const getMonsters = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/monsters');
};

export const getMonster = async (index: string): Promise<Monster> => {
  return fetchJson<Monster>(`/monsters/${index}`);
};

// Equipment
export const getEquipment = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/equipment');
};

export const getEquipmentItem = async (index: string): Promise<Equipment> => {
  return fetchJson<Equipment>(`/equipment/${index}`);
};

// Skills
export const getSkills = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/skills');
};

// Ability Scores
export const getAbilityScores = async (): Promise<ApiListResponse<ApiReference>> => {
  return fetchJson<ApiListResponse<ApiReference>>('/ability-scores');
};
