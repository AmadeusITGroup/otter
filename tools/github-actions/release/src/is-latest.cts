#!/usr/bin/env node
import {
  lt,
  valid,
} from 'semver';

/**
 * Returns true if the version is the latest
 * @param versionInput
 */
export async function isLatest(versionInput?: string) {
  const newVersion = valid(versionInput);
  let data = '';

  for await (const chunk of process.stdin) {
    data += chunk;
  }

  if (!newVersion) {
    // eslint-disable-next-line no-console -- only logger available
    console.error('Invalid version provided');
    process.exit(1);
  }

  const result = (JSON.parse(data) as string[])
    .filter((tag) => !!tag)
    .map((tag) => ({ tag, version: valid(tag) }))
    .filter((item): item is { tag: string; version: string } => !!item.version)
    .every(({ version }) => lt(version, newVersion));

  process.stdout.write(result ? 'true' : 'false');
}
