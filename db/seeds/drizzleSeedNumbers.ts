import process from 'node:process';

const parseDrizzleSeedOption = (): number => {
  const raw = process.env.DRIZZLE_SEED;
  if (raw === undefined || raw === '') {
    // eslint-disable-next-line unicorn/number-literal-case, unicorn/numeric-separators-style
    return 0x6d41_5eed;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(parsed)) {
    throw new TypeError(`DRIZZLE_SEED must be a base-10 safe integer. Received ${raw}.`);
  }
  return parsed;
};

const baseDrizzleSeed = (): number => parseDrizzleSeedOption();

export const drizzleSeedForMagicItems = (): number => baseDrizzleSeed() + 1_836_291_113;

export const drizzleSeedForMonsters = (): number => baseDrizzleSeed() + 2_032_817_916;

export const drizzleSeedForSpells = (): number => baseDrizzleSeed() + 6_129_281_103;
