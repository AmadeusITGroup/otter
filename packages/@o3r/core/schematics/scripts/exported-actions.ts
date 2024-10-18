import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getExportedSymbolsFromFile
} from '@o3r/schematics';
import {
  sync as globbySync
} from 'globby';
import * as ts from 'typescript';

const moduleName = 'store';

const moduleFolderPath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'packages', '@o3r', moduleName, 'src');
const outputJsonPath = path.resolve(__dirname, 'exported-actions-v3.json');
const actionFiles = globbySync(path.posix.join(moduleFolderPath, '**', '*.actions.ts').replace(/\\/g, '/'));

const actionsProgram = ts.createProgram(actionFiles, {});

const exportedActions = actionFiles.reduce((acc, actionFile) => {
  // Because v3 actions were classes, we retrieve all the classes exported by the Actions files
  getExportedSymbolsFromFile(actionsProgram, actionFile)
    // eslint-disable-next-line no-bitwise
    .filter((symbol) => symbol.flags & ts.SymbolFlags.Class)
    .forEach((symbol) => {
      // And pre-populate the migrated name which in 80% of the case will be a lowerCamelCase version of the classname
      acc[symbol.name] = symbol.name.charAt(0).toLowerCase() + symbol.name.slice(1);
    });
  return acc;
}, {} as Record<string, string>);

fs.writeFileSync(outputJsonPath, JSON.stringify(exportedActions, null, 2));
