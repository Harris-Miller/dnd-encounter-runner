import process from 'node:process';

import { createSeedClient } from './connection.ts';
import { discoverDataJsonFilenames } from './paths.ts';
import { seedMagicItems } from './seedMagicItems.ts';
import { seedMonsters } from './seedMonsters.ts';
import { seedSpells } from './seedSpells.ts';

const KNOWN_DATA_FILENAMES = ['magicItems.json', 'monsters.json', 'spells.json'] as const;

const isKnownDataFilename = (name: string): boolean => (KNOWN_DATA_FILENAMES as readonly string[]).includes(name);

const assertDataDirectoryIsSupported = (): void => {
  const files = discoverDataJsonFilenames();
  const unknown = files.filter(f => !isKnownDataFilename(f));
  if (unknown.length > 0) {
    throw new Error(
      `Unsupported JSON file(s) in data/: ${unknown.join(', ')}. Add a seed handler in db/seeds or remove the file.`,
    );
  }
};

const parseArgs = (argv: string[]): { appendOnly: boolean; targets: string[] } => {
  const flags = new Set<string>();
  const positional: string[] = [];
  for (const arg of argv) {
    if (arg === '--append') {
      flags.add('append');
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    } else {
      throw new Error(`Unknown argument "${arg}". Supported flags: --append`);
    }
  }
  return { appendOnly: flags.has('append'), targets: positional };
};

const run = async (): Promise<void> => {
  assertDataDirectoryIsSupported();

  const { appendOnly, targets } = parseArgs(process.argv.slice(2));
  const replaceExisting = !appendOnly;

  const effectiveTargets = targets.length === 0 ? (['spells', 'monsters', 'magic-items'] as const) : targets;

  const client = createSeedClient();

  try {
    for (const target of effectiveTargets) {
      if (target === 'spells') {
        const count = await seedSpells({ client, replaceExisting });
        console.log(`Seeded ${count} spells.`);
      } else if (target === 'monsters') {
        const count = await seedMonsters({ client, replaceExisting });
        console.log(`Seeded ${count} monsters.`);
      } else if (target === 'magic-items' || target === 'magicItems') {
        const count = await seedMagicItems({ client, replaceExisting });
        console.log(`Seeded ${count} magic items.`);
      } else {
        throw new Error(
          `Unknown seed target "${target}". Use spells, monsters, magic-items, or run with no args for all.`,
        );
      }
    }
  } finally {
    await client.close();
  }
};

await run();
