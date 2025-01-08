import * as vscode from 'vscode';
import {
  findPathAndExecuteSchematic,
} from './common';

const getExtraOptions = async () => {
  const componentType = await vscode.window.showQuickPick([
    'Component',
    'ExposedComponent',
    'Block',
    'Page'
  ], { canPickMany: false }) || 'Component';
  const extraOptions = [
    `--component-type=${componentType}`
  ];
  return extraOptions;
};

export const generateConvertComponentCommand = findPathAndExecuteSchematic(
  '@o3r/core:convert-component',
  getExtraOptions
);
