#!/usr/bin/env node
import * as minimist from 'minimist';
import {
  gt,
  lt,
  valid,
} from 'semver';

const argv = minimist(process.argv.slice(2));
const version = valid(argv._.at(0));

let data = '';

async function main() {
  for await (const chunk of process.stdin) {
    data += chunk;
  }

  if (!version) {
    // eslint-disable-next-line no-console -- only logger available
    console.error('Invalid version provided');
    process.exit(1);
  }

  const previousVersion = (JSON.parse(data) as string[])
    .filter((tag) => !!tag)
    .map((tag) => ({ tag, version: valid(tag) }))
    .filter((item): item is { tag: string; version: string } => !!item.version)
    .reduce<{ tag: string; version: string } | undefined>((acc, item) => {
      if (lt(item.version, version) && (!acc || gt(item.version, acc.version))) {
        acc = item;
      }
      return acc;
    }, undefined);

  process.stdout.write(previousVersion?.tag || '');
}

void main();
