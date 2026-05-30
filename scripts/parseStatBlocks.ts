/* eslint-disable @typescript-eslint/no-loop-func */
/**
 * Parse D&D Beyond HTML stat blocks (from JSON array of HTML strings) into
 * stat-block JSON objects matching the SRD schema.
 *
 * Note: This was written and maintained by AI agents
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import process from 'node:process';

const SIZE_PART = /(?:Tiny|Small|Medium|Large|Huge|Gargantuan)(?:\s+or\s+(?:Tiny|Small|Medium|Large|Huge|Gargantuan))?/;
const SIZE_TYPE_ALIGN_RE = new RegExp(`^(${SIZE_PART.source})\\s+(.+?),\\s*(.+)$`);

interface AbilityEntry {
  mod: number;
  save: number;
  score: number;
}

interface ParsedStatBlock {
  actions: string[];
  alignment: null | string;
  armorClass: null | number;
  bonusActions: string[];
  challengeRating: null | string;
  charisma: number;
  charismaSave: number;
  constitution: number;
  constitutionSave: number;
  creatureType: null | string;
  descriptiveTags: null | string;
  dexterity: number;
  dexteritySave: number;
  experiencePoints: null | number;
  experiencePointsAlt: null | string;
  gear: null | string;
  hitPointDice: null | string;
  hitPoints: null | number;
  immunities: string[];
  initiativeModifier: null | string;
  initiativeScore: null | number;
  intelligence: number;
  intelligenceSave: number;
  languages: null | string;
  legendaryActions: string[];
  name: null | string;
  proficiencyBonus: null | number;
  reactions: string[];
  resistances: string[];
  senses: null | string[];
  size: null | string;
  skills: null | string[];
  speed: null | string;
  speedBurrow: null | string;
  speedClimb: null | string;
  speedFly: null | string;
  speedSwim: null | string;
  strength: number;
  strengthSave: number;
  traits: string[];
  vulnerabilities: null | string;
  wisdom: number;
  wisdomSave: number;
}

const unesc = (s: string): string => {
  let out = s.trim();
  if (out.startsWith('"')) out = out.slice(1);
  if (out.endsWith('"')) out = out.slice(0, -1);
  return out.replace(/\\n/g, '\n').replace(/\\"/g, '"');
};

const stripHtml = (html: string): string => html.replace(/<[^>]+>/g, ' ').trim();

const parseSizeTypeAlign = (text: string): [null | string, null | string, null | string, null | string] => {
  const trimmed = text.trim();

  if (trimmed === '') return [null, null, null, null];

  const match = trimmed.match(SIZE_TYPE_ALIGN_RE);

  if (!match) return [null, null, null, null];

  const [, size, typeAndTags, alignment] = match.map((m: string | undefined) => m?.trim());

  if (size == null || typeAndTags == null || alignment == null) return [null, null, null, null];

  const paren = typeAndTags.indexOf('(');
  const creatureType = paren >= 0 ? typeAndTags.slice(0, paren).trim() : typeAndTags;
  const descriptiveTags = paren >= 0 ? typeAndTags.slice(paren).trim() : null;
  return [size, creatureType, descriptiveTags, alignment];
};

const parseSkills = (raw: null | string | undefined): null | string[] => {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  return raw
    .split(',')
    .map(p => p.trim())
    .filter(p => p !== '');
};

const parseSenses = (raw: null | string | undefined): null | string[] => {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  return raw
    .split(';')
    .map(p => p.trim())
    .filter(p => p !== '');
};

const parseCommaSeparatedList = (raw: null | string | undefined): string[] => {
  if (raw === null || raw === undefined || raw.trim() === '') return [];
  return raw
    .split(',')
    .map(p => p.trim())
    .filter(p => p !== '');
};

const parseSpeed = (
  raw: null | string | undefined,
): [null | string, null | string, null | string, null | string, null | string] => {
  const text = raw?.trim() ?? '';
  if (text === '') return [null, null, null, null, null];

  const burrowM = text.match(/Burrow\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const climbM = text.match(/Climb\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const flyM = text.match(/Fly\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const swimM = text.match(/Swim\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const burrow = burrowM?.[1]?.trim() ?? null;
  const climb = climbM?.[1]?.trim() ?? null;
  const fly = flyM?.[1]?.trim() ?? null;
  const swim = swimM?.[1]?.trim() ?? null;
  const [firstSeg] = text.split(',');
  const first = firstSeg?.trim() ?? '';
  const isKeywordFirst = /^(Burrow|Climb|Fly|Swim)\s/i.test(first);
  const speed = isKeywordFirst ? null : first;
  return [speed, burrow, climb, fly, swim];
};

const parseCrLine = (text: string): [null | string, null | number, null | string, null | number] => {
  const trimmed = text.trim();

  if (trimmed === '') return [null, null, null, null];

  const crMatch = trimmed.match(/^(\d+(?:\/\d+)?)\s*\(?/);
  const challengeRating = crMatch?.[1] ?? null;
  const xpMatch = trimmed.match(/XP\s*([\d,]+)/);
  const experiencePoints = xpMatch?.[1] != null ? Number.parseInt(xpMatch[1].replace(/,/g, ''), 10) : null;
  const altMatch = trimmed.match(/or\s+([\d,]+)\s+in\s+lair/i);
  const experiencePointsAlt = altMatch?.[1]?.trim() ?? null;
  const pbMatch = trimmed.match(/PB\s*([+-]?\d+)/);
  const proficiencyBonus = pbMatch?.[1] != null ? Number.parseInt(pbMatch[1], 10) : null;

  return [challengeRating, experiencePoints, experiencePointsAlt, proficiencyBonus];
};

const ABILITY_NAMES = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'] as const;

const parseAbilities = (html: string): Record<string, AbilityEntry> => {
  const out: Record<string, AbilityEntry> = {};

  for (const ab of ABILITY_NAMES) {
    const pat = new RegExp(
      `<th>${ab}</th>\\s*<td>(\\d+)</td>(?:\\s*<[^>]+>)*\\s*<strong>([+-]?\\d+)</strong>(?:\\s*<[^>]+>)*\\s*<strong>([+-]?\\d+)</strong>`,
      's',
    );
    const m = html.match(pat);
    if (m?.[1] !== undefined && m[2] !== undefined && m[3] !== undefined) {
      out[ab] = {
        mod: Number.parseInt(m[2], 10),
        save: Number.parseInt(m[3], 10),
        score: Number.parseInt(m[1], 10),
      };
    }
  }

  return out;
};

const AB_MAP: Record<string, string> = {
  Cha: 'charisma',
  Con: 'constitution',
  Dex: 'dexterity',
  Int: 'intelligence',
  Str: 'strength',
  Wis: 'wisdom',
};

const buildFlatAbilities = (abilities: Record<string, AbilityEntry>): Record<string, number> => {
  return Object.entries(AB_MAP)
    .map(([ab, key]) => [abilities[ab], key] as const)
    .filter((tuple): tuple is [AbilityEntry, string] => tuple[0] != null)
    .reduce<Record<string, number>>((acc, [entry, key]) => {
      acc[key] = entry.score;
      acc[`${key}Save`] = entry.save;
      return acc;
    }, {});
};

interface HeaderMatch {
  fullLength: number;
  index: number;
  section: string;
}

const collectHeaders = (s: string): HeaderMatch[] => {
  const headerRegex = /<p class="monster-header"[^>]*>([^<]+)<\/p>/g;
  const headers: HeaderMatch[] = [];
  let m: null | RegExpExecArray;
  while ((m = headerRegex.exec(s)) !== null) {
    const [, section] = m;
    headers.push({
      fullLength: m[0].length,
      index: m.index,
      section: section !== undefined ? section.trim() : '',
    });
  }
  return headers;
};

const extractTextsFromHtml = (s: string): string[] => {
  const pBlocks = [...s.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
  return pBlocks.map(m => {
    const [, content] = m;
    if (content == null) return '';
    return stripHtml(content).replace(/\s+/g, ' ').trim();
  });
};

const extractFieldValues = (
  texts: string[],
): {
  ac: null | number;
  crLine: null | string;
  gear: null | string;
  hp: null | number;
  hpDice: null | string;
  immunitiesRaw: null | string;
  initMod: null | string;
  initScore: null | number;
  languages: null | string;
  resistancesRaw: null | string;
  sensesRaw: null | string;
  skillsRaw: null | string;
  speedRaw: null | string;
  vulnerabilities: null | string;
} => {
  let ac: null | number = null;
  let initMod: null | string = null;
  let initScore: null | number = null;
  let hp: null | number = null;
  let hpDice: null | string = null;
  let speedRaw: null | string = null;
  let skillsRaw: null | string = null;
  let sensesRaw: null | string = null;
  let languages: null | string = null;
  let crLine: null | string = null;
  let resistancesRaw: null | string = null;
  let immunitiesRaw: null | string = null;
  let vulnerabilities: null | string = null;
  let gear: null | string = null;

  for (const t of texts) {
    if (t.includes('AC') && t.includes('Initiative')) {
      const ma = t.match(/AC\s*(\d+)/);
      if (ma?.[1] !== undefined) ac = Number.parseInt(ma[1], 10);
      const initMa = t.match(/Initiative\s*([+-]?\d+)\s*\((\d+)\)/);
      if (initMa?.[1] !== undefined && initMa[2] !== undefined) {
        [, initMod] = initMa;
        initScore = Number.parseInt(initMa[2], 10);
      }
    } else if (t.includes('HP') && t.includes('(')) {
      const ma = t.match(/(\d+)\s*\(([^)]+)\)/);
      if (ma?.[1] !== undefined && ma[2] !== undefined) {
        hp = Number.parseInt(ma[1], 10);
        hpDice = ma[2].trim();
      }
    } else if (t.startsWith('Speed ')) {
      speedRaw = t.replace('Speed ', '').trim();
    } else if (t.startsWith('Skills ')) {
      skillsRaw = t.replace('Skills ', '').trim();
    } else if (t.startsWith('Senses ')) {
      sensesRaw = t.replace('Senses ', '').trim();
    } else if (t.startsWith('Languages ')) {
      languages = t.replace('Languages ', '').trim();
    } else if (t.startsWith('CR ')) {
      crLine = t.replace('CR ', '').trim();
    } else if (t.startsWith('Resistances ')) {
      resistancesRaw = t.replace('Resistances ', '').trim();
    } else if (t.startsWith('Immunities ')) {
      immunitiesRaw = t.replace('Immunities ', '').trim();
    } else if (t.startsWith('Vulnerabilities ')) {
      vulnerabilities = t.replace('Vulnerabilities ', '').trim();
    } else if (t.startsWith('Gear ')) {
      gear = t.replace('Gear ', '').trim();
    }
  }

  return {
    ac,
    crLine,
    gear,
    hp,
    hpDice,
    immunitiesRaw,
    initMod,
    initScore,
    languages,
    resistancesRaw,
    sensesRaw,
    skillsRaw,
    speedRaw,
    vulnerabilities,
  };
};

const parseSectionBlocks = (
  s: string,
  headers: HeaderMatch[],
  legendaryIntro: null | string,
): {
  actions: string[];
  bonusActions: string[];
  legendaryActions: string[];
  reactions: string[];
  traits: string[];
} => {
  const traits: string[] = [];
  const actions: string[] = [];
  const bonusActions: string[] = [];
  const reactions: string[] = [];
  let legendaryActions: string[] = [];
  let remainingLegendaryIntro = legendaryIntro;

  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i]!;
    const nextHeader = headers[i + 1];
    const sec = header.section;
    const start = header.index + header.fullLength;
    const end = nextHeader !== undefined ? nextHeader.index : s.length;
    const block = s.slice(start, end < 0 ? s.length : end);
    const paras = [...block.matchAll(/<p data-content-chunk-id="[^"]*">([\s\S]*?)<\/p>/g)];

    if (sec === 'Legendary Actions' && remainingLegendaryIntro !== null) {
      legendaryActions = [remainingLegendaryIntro];
      remainingLegendaryIntro = null;
    }

    paras
      .map(p => p[1])
      .filter(content => content != null)
      .forEach(content => {
        const t = stripHtml(content).replace(/\s+/g, ' ').trim();
        if (t !== '') {
          if (sec === 'Traits') traits.push(t);
          else if (sec === 'Actions') actions.push(t);
          else if (sec === 'Bonus Actions') bonusActions.push(t);
          else if (sec === 'Reactions') reactions.push(t);
          else if (sec === 'Legendary Actions') legendaryActions.push(t);
        }
      });
  }

  if (remainingLegendaryIntro !== null && legendaryActions.length === 0) {
    legendaryActions = [remainingLegendaryIntro];
  }

  return {
    actions,
    bonusActions,
    legendaryActions,
    reactions,
    traits,
  };
};

const defaultScores = {
  charisma: 0,
  charismaSave: 0,
  constitution: 0,
  constitutionSave: 0,
  dexterity: 0,
  dexteritySave: 0,
  intelligence: 0,
  intelligenceSave: 0,
  strength: 0,
  strengthSave: 0,
  wisdom: 0,
  wisdomSave: 0,
};

const parseOne = (htmlRaw: string): ParsedStatBlock => {
  const s = unesc(htmlRaw);
  const texts = extractTextsFromHtml(s);

  let name: null | string = null;
  const nameMatch = s.match(/<a[^>]*class="[^"]*monster-tooltip[^"]*"[^>]*>([^<]+)<\/a>/);
  if (nameMatch) {
    const [, n] = nameMatch;
    if (n !== undefined) name = n.trim();
  }

  const sizeTypeAlign = texts[0] ?? null;
  const [size, creatureType, descriptiveTags, alignment] = parseSizeTypeAlign(sizeTypeAlign ?? '');

  const fields = extractFieldValues(texts);
  const [challengeRating, experiencePoints, experiencePointsAlt, proficiencyBonus] = parseCrLine(fields.crLine ?? '');
  const [speed, burrowSpeed, climbSpeed, flySpeed, swimSpeed] = parseSpeed(fields.speedRaw);
  const skills = parseSkills(fields.skillsRaw);
  const senses = parseSenses(fields.sensesRaw);
  const resistances = parseCommaSeparatedList(fields.resistancesRaw);
  const immunities = parseCommaSeparatedList(fields.immunitiesRaw);

  const abilities = parseAbilities(s);
  const headers = collectHeaders(s);

  let legendaryIntro: null | string = null;
  const legendaryMatch = s.match(/<p class="legendary-actions"[^>]*>([\s\S]*?)<\/p>/);
  if (legendaryMatch) {
    const [_, introContent] = legendaryMatch;
    legendaryIntro = introContent !== undefined ? stripHtml(introContent).replace(/\s+/g, ' ').trim() : null;
  }

  const { actions, bonusActions, legendaryActions, reactions, traits } = parseSectionBlocks(s, headers, legendaryIntro);

  const flatAbilities = buildFlatAbilities(abilities);

  return {
    actions,
    alignment,
    armorClass: fields.ac,
    bonusActions,
    challengeRating,
    charisma: defaultScores.charisma,
    charismaSave: defaultScores.charismaSave,
    constitution: defaultScores.constitution,
    constitutionSave: defaultScores.constitutionSave,
    creatureType,
    descriptiveTags,
    dexterity: defaultScores.dexterity,
    dexteritySave: defaultScores.dexteritySave,
    experiencePoints,
    experiencePointsAlt,
    gear: fields.gear,
    hitPointDice: fields.hpDice,
    hitPoints: fields.hp,
    immunities,
    initiativeModifier: fields.initMod,
    initiativeScore: fields.initScore,
    intelligence: defaultScores.intelligence,
    intelligenceSave: defaultScores.intelligenceSave,
    languages: fields.languages,
    legendaryActions,
    name,
    proficiencyBonus,
    reactions,
    resistances,
    senses,
    size,
    skills,
    speed,
    speedBurrow: burrowSpeed,
    speedClimb: climbSpeed,
    speedFly: flySpeed,
    speedSwim: swimSpeed,
    strength: defaultScores.strength,
    strengthSave: defaultScores.strengthSave,
    traits,
    vulnerabilities: fields.vulnerabilities,
    wisdom: defaultScores.wisdom,
    wisdomSave: defaultScores.wisdomSave,
    ...flatAbilities,
  };
};

const main = (): void => {
  if (process.argv.length !== 4) {
    process.stderr.write('Usage: parseStatBlocks.ts <input.json> <output.json>\n');
    process.exit(1);
  }
  const [, , inputPath, outputPath] = process.argv;
  if (inputPath === undefined || outputPath === undefined) {
    process.stderr.write('Missing input or output path\n');
    process.exit(1);
  }

  let data: unknown;
  try {
    const raw = readFileSync(inputPath, 'utf-8');
    data = JSON.parse(raw) as unknown;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Failed to read input: ${msg}\n`);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    process.stderr.write('Input JSON must be an array of HTML strings\n');
    process.exit(1);
  }

  const parsed: ParsedStatBlock[] = (data as string[]).map(parseOne);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf-8');
  process.stderr.write(`Parsed ${parsed.length} stat blocks to ${outputPath}\n`);
};

main();
