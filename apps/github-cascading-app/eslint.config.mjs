import local from './eslint.local.config.mjs';
import shared from '../../eslint.shared.config.mjs';

export default [
  ...shared,
  ...local
];
