# D&D Data Directory

This directory is for storing local JSON files if you want to use static data instead of (or in addition to) the API.

## Structure

You can organize data files here by type:
- `spells/` - Spell data
- `classes/` - Class data
- `races/` - Race data
- `monsters/` - Monster data
- `equipment/` - Equipment data
- `backgrounds/` - Background data

## Usage

If you want to use local JSON files instead of the API, you can:

1. Download JSON data from sources like:
   - https://github.com/nick-aschenbach/dnd-data
   - https://github.com/BTMorton/dnd-5e-srd/tree/master/json
   - Or create your own from D&D Beyond

2. Import them directly in your components:
```typescript
import spellsData from './data/spells/spells.json';
```

3. Or extend the `dndApi` service to check local files first, then fall back to API.

## Note on 2024 Rules

The D&D 5e API (dnd5eapi.co) contains SRD (Systems Reference Document) content, which is the open content from D&D 5e. For full 2024 Player's Handbook and DM Guide content, you may need to:

- Use D&D Beyond's web interface
- Create your own JSON files from official sources (respecting copyright)
- Wait for community repositories to update with 2024 content
