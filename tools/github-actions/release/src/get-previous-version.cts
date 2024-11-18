import { valid, gt, lt } from 'semver';

export async function getPreviousVersion(versionInput?: string) {
  const version = valid(versionInput);
  let data = '';

  for await (const chunk of process.stdin) data += chunk;

  if (!version) {
    console.error('Invalid version provided');
    process.exit(1);
  }

  const previousVersion = (JSON.parse(data) as string[])
    .filter((tag) => !!tag)
    .map((tag) => ({tag, version: valid(tag)}))
    .filter((item): item is { tag: string, version: string } => !!item.version)
    .reduce<{tag: string, version: string} | undefined>((acc, item) => {
      if (lt(item.version, version) && (!acc || gt(item.version, acc.version))) {
        acc = item;
      }
      return acc;
    }, undefined);

  process.stdout.write(previousVersion?.tag || '');
}
