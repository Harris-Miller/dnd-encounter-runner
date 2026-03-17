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
  alignment: string | null;
  armorClass: number | null;
  bonusActions: string[];
  challengeRating: string | null;
  charisma: number;
  charismaSave: number;
  constitution: number;
  constitutionSave: number;
  creatureType: string | null;
  descriptiveTags: string | null;
  dexterity: number;
  dexteritySave: number;
  experiencePoints: number | null;
  experiencePointsAlt: string | null;
  gear: string | null;
  hitPointDice: string | null;
  hitPoints: number | null;
  immunities: string[];
  initiativeModifier: string | null;
  initiativeScore: number | null;
  intelligence: number;
  intelligenceSave: number;
  languages: string | null;
  legendaryActions: string[];
  name: string | null;
  proficiencyBonus: number | null;
  reactions: string[];
  resistances: string[];
  senses: string[] | null;
  size: string | null;
  skills: string[] | null;
  speed: string | null;
  speedBurrow: string | null;
  speedClimb: string | null;
  speedFly: string | null;
  speedSwim: string | null;
  strength: number;
  strengthSave: number;
  traits: string[];
  vulnerabilities: string | null;
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

const parseSizeTypeAlign = (text: string): [string | null, string | null, string | null, string | null] => {
  const trimmed = text.trim();
  if (trimmed === '') return [null, null, null, null];
  const match = trimmed.match(SIZE_TYPE_ALIGN_RE);
  if (!match) return [null, null, null, null];
  const [, g1, g2, g3] = match;
  if (g1 === undefined || g2 === undefined || g3 === undefined) return [null, null, null, null];
  const size = g1.trim();
  const typeAndTags = g2.trim();
  const alignment = g3.trim();
  const paren = typeAndTags.indexOf('(');
  const creatureType = paren >= 0 ? typeAndTags.slice(0, paren).trim() : typeAndTags;
  const descriptiveTags = paren >= 0 ? typeAndTags.slice(paren).trim() : null;
  return [size, creatureType, descriptiveTags, alignment];
};

const parseSkills = (raw: string | null | undefined): string[] | null => {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  return raw
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
};

const parseSenses = (raw: string | null | undefined): string[] | null => {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  return raw
    .split(';')
    .map(p => p.trim())
    .filter(Boolean);
};

const parseCommaSeparatedList = (raw: string | null | undefined): string[] => {
  if (raw === null || raw === undefined || raw.trim() === '') return [];
  return raw
    .split(',')
    .map(p => p.trim())
    .filter(Boolean);
};

const parseSpeed = (
  raw: string | null | undefined,
): [string | null, string | null, string | null, string | null, string | null] => {
  if (raw === null || raw === undefined || raw.trim() === '') return [null, null, null, null, null];
  const text = raw.trim();
  const burrowM = text.match(/Burrow\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const climbM = text.match(/Climb\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const flyM = text.match(/Fly\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const swimM = text.match(/Swim\s+([^,;]+?)(?=\s*[,;]|$)/i);
  const burrow = burrowM?.[1] !== undefined ? burrowM[1].trim() : null;
  const climb = climbM?.[1] !== undefined ? climbM[1].trim() : null;
  const fly = flyM?.[1] !== undefined ? flyM[1].trim() : null;
  const swim = swimM?.[1] !== undefined ? swimM[1].trim() : null;
  const [firstSeg] = text.split(',');
  const first = firstSeg !== undefined ? firstSeg.trim() : '';
  const isKeywordFirst = /^(Burrow|Climb|Fly|Swim)\s/i.test(first);
  const speed = isKeywordFirst ? null : first;
  return [speed, burrow, climb, fly, swim];
};

const parseCrLine = (text: string): [string | null, number | null, string | null, number | null] => {
  const trimmed = text.trim();
  if (trimmed === '') return [null, null, null, null];
  const crMatch = trimmed.match(/^(\d+(?:\/\d+)?)\s*\(?/);
  const challengeRating = crMatch?.[1] ?? null;
  const xpMatch = trimmed.match(/XP\s*([\d,]+)/);
  const experiencePoints = xpMatch?.[1] !== undefined ? Number.parseInt(xpMatch[1].replace(/,/g, ''), 10) : null;
  const altMatch = trimmed.match(/or\s+([\d,]+)\s+in\s+lair/i);
  const experiencePointsAlt = altMatch?.[1] !== undefined ? altMatch[1].trim() : null;
  const pbMatch = trimmed.match(/PB\s*([+-]?\d+)/);
  const proficiencyBonus = pbMatch?.[1] !== undefined ? Number.parseInt(pbMatch[1], 10) : null;
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
  const flat: Record<string, number> = {};
  for (const [ab, key] of Object.entries(AB_MAP)) {
    const entry = abilities[ab];
    if (entry) {
      flat[key] = entry.score;
      flat[`${key}Save`] = entry.save;
    }
  }
  return flat;
};

interface HeaderMatch {
  fullLength: number;
  index: number;
  section: string;
}

const collectHeaders = (s: string): HeaderMatch[] => {
  const headerRegex = /<p class="monster-header"[^>]*>([^<]+)<\/p>/g;
  const headers: HeaderMatch[] = [];
  let m: RegExpExecArray | null;
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
    return content !== undefined ? stripHtml(content).replace(/\s+/g, ' ').trim() : '';
  });
};

const extractFieldValues = (
  texts: string[],
): {
  ac: number | null;
  crLine: string | null;
  gear: string | null;
  hp: number | null;
  hpDice: string | null;
  immunitiesRaw: string | null;
  initMod: string | null;
  initScore: number | null;
  languages: string | null;
  resistancesRaw: string | null;
  sensesRaw: string | null;
  skillsRaw: string | null;
  speedRaw: string | null;
  vulnerabilities: string | null;
} => {
  let ac: number | null = null;
  let initMod: string | null = null;
  let initScore: number | null = null;
  let hp: number | null = null;
  let hpDice: string | null = null;
  let speedRaw: string | null = null;
  let skillsRaw: string | null = null;
  let sensesRaw: string | null = null;
  let languages: string | null = null;
  let crLine: string | null = null;
  let resistancesRaw: string | null = null;
  let immunitiesRaw: string | null = null;
  let vulnerabilities: string | null = null;
  let gear: string | null = null;

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
  legendaryIntro: string | null,
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

  let name: string | null = null;
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

  let legendaryIntro: string | null = null;
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
