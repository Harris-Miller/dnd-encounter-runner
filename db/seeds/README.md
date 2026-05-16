## Verify same uuids

run this

```bash
pnpm run db:seed
node db/seeds/verifyDeterministicReseed.ts --capture > seed-verify-snapshot.json
pnpm run db:seed
node db/seeds/verifyDeterministicReseed.ts --compare --from-file seed-verify-snapshot.json
rm -f seed-verify-snapshot.json
```
