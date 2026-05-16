import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export const dataDirPath = join(repoRoot, 'data');

export const discoverDataJsonFilenames = (): string[] =>
  readdirSync(dataDirPath)
    .filter(name => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));

export const resolveDataJsonPath = (filename: string): string => join(dataDirPath, filename);
