/**
 * Verifies that plugin marketplace configuration files are kept in sync.
 * Compares paired files (e.g. .claude-plugin/marketplace.json vs .github/plugin/marketplace.json)
 * and throws an error if any pair has diverged.
 */
import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';

const root = resolve(import.meta.dirname, '..', '..', '..', '..');

const filePairs = [
  ['.claude-plugin/marketplace.json', '.github/plugin/marketplace.json'],
  ['tools/llm/plugins/otter/plugin.json', 'tools/llm/plugins/otter/.claude-plugin/plugin.json']
];

const errors = filePairs
  .filter(([path1, path2]) => {
    const content1 = readFileSync(resolve(root, path1), { encoding: 'utf8' });
    const content2 = readFileSync(resolve(root, path2), { encoding: 'utf8' });
    return content1 !== content2;
  })
  .map(([path1, path2]) => `${path1} and ${path2} are out of sync. Please ensure both files have the same content.`);

if (errors.length > 0) {
  throw new Error(errors.join('\n'));
}
