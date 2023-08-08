import * as vscode from 'vscode';
import { findPathAndExecuteSchematic } from './common';

const getExtraOptions = () => Promise.resolve([
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  `--activate-dummy=${!!vscode.workspace.getConfiguration('otter.generate').get<boolean>('activateDummy')}`
]);

export const generateAddLocalizationToComponentCommand = findPathAndExecuteSchematic(
  '@o3r/localization:localization-to-component',
  getExtraOptions
);
