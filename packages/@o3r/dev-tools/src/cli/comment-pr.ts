#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

console.warn('This CLI is deprecated, please use `o3r-comment-pr` from the package `@o3r/artifactory-tools`');

spawnSync('o3r-comment-pr', process.argv.slice(2), {
  shell: true,
  stdio: 'inherit'
});
