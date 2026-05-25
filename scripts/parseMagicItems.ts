/**
 * Parse stuff/magicItems.html (D&D Beyond magic items) into a flat JSON array
 * written to data/magicItems.json.
 *
 * Run: pnpm run parse:magic-items (Node runs this file as TypeScript; see tsconfig.node.json)
 */

import { parse } from 'node-html-parser';

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const MAGIC_ITEM_H3_START = /<h3\s[^>]*class="[^"]*compendium--magic-item[^"]*"[^>]*>/i;

interface MagicItemJson {
  category: string;
  categorySpecifier: string | null;
  ddbId: string | null;
  description: string;
  isConsumable: boolean;
  isCursed: boolean;
  name: string;
  rarity: string;
  requiresAttunement: boolean;
  slug: string | null;
  variantRarities: string[] | null;
}

const extractText = function (html: string): string {
  const root = parse(html, { lowerCaseTagName: true });
  return root.textContent.replace(/\s+/g, ' ').trim();
};

const RARITY_REGEX = /(common|uncommon|very\s+rare|rare|legendary|artifact)/i;

const parseCategoryLine = function (emText: string): {
  category: string;
  categorySpecifier: string | null;
  rarity: string;
  requiresAttunement: boolean;
  variantRarities: string[] | null;
} {
  const stripped = extractText(emText);
  const firstRarityMatch = stripped.match(RARITY_REGEX);
  let categoryPart = stripped;
  let rarityPart = '';
  if (firstRarityMatch?.index !== undefined) {
    categoryPart = stripped.slice(0, firstRarityMatch.index).replace(/,\s*$/, '').trim();
    rarityPart = stripped.slice(firstRarityMatch.index).trim();
  }
  const requiresAttunement = /requires\s+attunement/i.test(rarityPart) || /attunement\s+by/i.test(rarityPart);
  const rarityNorm = rarityPart
    .replace(/\s*\(requires\s+attunement\)/gi, '')
    .replace(/\s*\(attunement\s+by[^)]*\)/gi, '')
    .trim();
  const variantRarities: string[] = [];
  const rarityTokens = rarityNorm.split(/\s*,\s*|\s+or\s+/i).filter(Boolean);
  const pickRarityWord = (t: string): string | null => {
    const s = t.trim();
    const m = s.match(/(common|uncommon|very\s+rare|rare|legendary|artifact)/i);
    return m?.[1] ?? null;
  };
  const mainRarity = pickRarityWord(rarityTokens[0] ?? rarityNorm) ?? rarityNorm;
  if (rarityTokens.length > 1) {
    rarityTokens.forEach(t => {
      const w = pickRarityWord(t);
      if (w !== null && w !== '' && !variantRarities.includes(w)) {
        variantRarities.push(w);
      }
    });
  }
  let category = categoryPart;
  let categorySpecifier: string | null = null;
  const paren = categoryPart.indexOf('(');
  if (paren !== -1) {
    const close = categoryPart.indexOf(')', paren);
    if (close !== -1) {
      category = categoryPart.slice(0, paren).trim();
      const spec = categoryPart.slice(paren + 1, close).trim();
      categorySpecifier = spec !== '' ? spec : null;
    }
  }
  return {
    category,
    categorySpecifier: categorySpecifier ?? null,
    rarity: mainRarity,
    requiresAttunement,
    variantRarities: variantRarities.length > 0 ? variantRarities : null,
  };
};

const extractNameSlugDdbIdFromH3 = function (blockHtml: string): {
  ddbId: string | null;
  name: string;
  slug: string | null;
} {
  const root = parse(blockHtml, { lowerCaseTagName: true });
  const h3 = root.querySelector('h3.compendium--magic-item') ?? root.querySelector('h3');
  const scope = h3 ?? root;
  const link = scope.querySelector('a.magic-item-tooltip') ?? scope.querySelector('a[href*="/magic-items/"]');
  if (link !== null) {
    const href = link.getAttribute('href') ?? '';
    const match = href.match(/\/magic-items\/(\d+)-([^/?]+)/);
    const ddbId = match?.[1] ?? null;
    const slug = match?.[2] ?? null;
    const name = extractText(link.innerHTML);
    if (name !== '') return { ddbId, name, slug };
  }
  const name = h3 !== null ? extractText(h3.innerHTML) : extractText(root.innerHTML);
  return { ddbId: null, name: name !== '' ? name : 'Unknown', slug: null };
};

const collectDescriptionAndCategory = function (blockHtml: string): {
  categoryLine: string | null;
  descriptionParts: string[];
} {
  const root = parse(blockHtml, { lowerCaseTagName: true });
  const descriptionParts: string[] = [];
  const firstP = root.querySelector('p');
  const em = firstP?.querySelector('em');
  const categoryLineText = em !== null && em !== undefined ? em.textContent.replace(/\s+/g, ' ').trim() : null;
  const allPs = root.querySelectorAll('p');
  let skipFirst = categoryLineText !== null;
  for (const p of allPs) {
    const hasEm = p.querySelector('em');
    if (hasEm !== null && skipFirst) {
      skipFirst = false;
    } else {
      const text = p.textContent.replace(/\s+/g, ' ').trim();
      if (text !== '') descriptionParts.push(text);
    }
  }
  const tableWrappers = root.querySelectorAll('.table-overflow-wrapper');
  for (const wrapper of tableWrappers) {
    const table = wrapper.querySelector('table');
    if (table !== null) {
      const rows: string[] = [];
      const trs = table.querySelectorAll('tr');
      trs.forEach(tr => {
        const cells = tr.querySelectorAll('th, td');
        rows.push(
          Array.from(cells)
            .map(c => c.textContent.replace(/\s+/g, ' ').trim())
            .join(' | '),
        );
      });
      if (rows.length > 0) descriptionParts.push(rows.join('\n'));
    }
  }
  return {
    categoryLine: categoryLineText,
    descriptionParts,
  };
};

const inferConsumable = function (category: string, description: string): boolean {
  const cat = category.toLowerCase();
  if (cat === 'potion' || cat === 'potions' || cat === 'scroll' || cat === 'scrolls') return true;
  const d = description.toLowerCase();
  return /\bconsumed\b/.test(d) || /\bused up\b/.test(d) || /\bloses its magic\b/.test(d) || /\bexpended\b/.test(d);
};

const inferCursed = function (description: string, categoryLine: string | null): boolean {
  const text = [description, categoryLine ?? ''].join(' ').toLowerCase();
  return /\bcurse[d]?\b/.test(text) || /\bcursed\b/.test(text);
};

const main = function (): void {
  const repoRoot = join(__dirname, '..');
  const inputPath = join(repoRoot, 'stuff', 'magicItems.html');
  const outputPath = join(repoRoot, 'data', 'magicItems.json');
  const html = readFileSync(inputPath, 'utf-8');
  const matchStarts: number[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(MAGIC_ITEM_H3_START.source, 'gi');
  while ((m = re.exec(html)) !== null) {
    matchStarts.push(m.index);
  }
  const blocks: string[] = [];
  for (let i = 0; i < matchStarts.length; i += 1) {
    const end = i + 1 < matchStarts.length ? matchStarts[i + 1]! : html.length;
    blocks.push(html.slice(matchStarts[i], end));
  }
  const items: MagicItemJson[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]!;
    if (block.trim() !== '') {
      const { name, slug, ddbId } = extractNameSlugDdbIdFromH3(block);
      const { categoryLine, descriptionParts } = collectDescriptionAndCategory(block);
      const description = descriptionParts.join('\n\n');
      const catLine = categoryLine ?? '';
      const { category, categorySpecifier, rarity, variantRarities, requiresAttunement } = parseCategoryLine(catLine);
      const isConsumable = inferConsumable(category, description);
      const isCursed = inferCursed(description, categoryLine);
      items.push({
        category,
        categorySpecifier,
        ddbId,
        description,
        isConsumable,
        isCursed,
        name,
        rarity,
        requiresAttunement,
        slug,
        variantRarities,
      });
    }
  }
  writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  process.stdout.write(`Wrote ${items.length} magic items to ${outputPath}\n`);
};

main();
