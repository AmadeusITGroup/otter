import { valid, lt } from 'semver';

export async function isLatest(versionInput?: string) {
  const newVersion = valid(versionInput);
  let data = '';

  for await (const chunk of process.stdin) data += chunk;

  if (!newVersion) {
    console.error('Invalid version provided');
    process.exit(1);
  }

  const isLatest = (JSON.parse(data) as string[])
    .filter((tag) => !!tag)
    .map((tag) => ({ tag, version: valid(tag) }))
    .filter((item): item is { tag: string, version: string } => !!item.version)
    .every(({ version }) => lt(version, newVersion));

  process.stdout.write(isLatest ? 'true' : 'false');
}
