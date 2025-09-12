import {
  dirname,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  mergeESLintFlatConfigs,
} from '@o3r/eslint-config/helpers';
import shared from './eslint.shared.config.mjs';

const __filename = fileURLToPath(import.meta.url);
// __dirname is not defined in ES module scope
const __dirname = dirname(__filename);

export default mergeESLintFlatConfigs(__dirname, '**/eslint.local.config.mjs', shared);
