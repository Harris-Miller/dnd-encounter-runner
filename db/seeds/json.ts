import { readFileSync } from 'node:fs';

export const readJsonArray = <T>(path: string, label: string): T[] => {
  const raw = readFileSync(path, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected ${label} to be a JSON array at ${path}`);
  }
  return parsed as T[];
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  if (size < 1) {
    throw new Error(`chunk size must be at least 1, got ${size}`);
  }
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};
