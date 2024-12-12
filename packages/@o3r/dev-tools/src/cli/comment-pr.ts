#!/usr/bin/env node
import {
  spawnSync,
} from 'node:child_process';

// eslint-disable-next-line no-console -- keep to warn of package deprecation
console.warn('This CLI is deprecated, please use `o3r-comment-pr` from the package `@o3r/azure-tools`');

spawnSync('o3r-comment-pr', process.argv.slice(2), {
  shell: true,
  stdio: 'inherit'
});
