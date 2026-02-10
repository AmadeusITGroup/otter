import {
  findPathAndExecuteSchematic,
} from './common';

/**
 * @deprecated Rely on Design Token strategy. Will be removed in v15
 */
export const generateAddThemingToComponentCommand = findPathAndExecuteSchematic('@o3r/styling:theming-to-component');
