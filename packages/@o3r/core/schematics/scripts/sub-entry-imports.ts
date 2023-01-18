import { getExportedSymbolsFromFile } from '@o3r/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import * as fs from 'node:fs';
import * as minimist from 'minimist';
import * as path from 'node:path';

const argv = minimist(process.argv.slice(2));

const moduleName = argv._[0];

const moduleFolderPath = path.resolve(__dirname, '..', '..', '..', '..', '..', 'packages', '@o3r', moduleName, 'src');
const outputJsonPath = path.resolve(__dirname, `${moduleName}-mapping.json`);

// Build a list of the index files of every sub-entry
const subEntries = fs.readdirSync(moduleFolderPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => ({
    indexFile: path.join(moduleFolderPath, dirent.name, 'index.ts').replace(/\\/g, '/'),
    name: dirent.name
  }));

// Build a list of the fixture.ts file of every sub-entry (today only applicable to services)
const fixtureFiles = fs.readdirSync(moduleFolderPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => ({
    indexFile: path.join(moduleFolderPath, dirent.name, 'fixtures.ts').replace(/\\/g, '/'),
    name: dirent.name
  }))
  .filter((fixture) => fs.existsSync(fixture.indexFile));

const subEntriesProgram = ts.createProgram(subEntries.map((subEntry) => subEntry.indexFile), {});

// Build an association between a sub-entry name and all the symbols exported by its index file
const mapping = subEntries.reduce((acc, subEntry) => {
  const exports = getExportedSymbolsFromFile(subEntriesProgram, subEntry.indexFile)
    .map((symbol) => symbol.name);

  exports.forEach((exportedMember) => {
    if (!acc[subEntry.name]) {
      acc[subEntry.name] = [];
    }
    acc[subEntry.name].push(exportedMember);
  });

  return acc;
}, {} as any);

// If working with fixtures, build a separate list of all the symbols exported by fixtures files
if (fixtureFiles.length > 0) {
  const fixturesProgram = ts.createProgram(fixtureFiles.map((fixture) => fixture.indexFile), {});
  const availableFixtures: string[] = [];
  fixtureFiles.forEach((fixture) => {
    const exports = getExportedSymbolsFromFile(fixturesProgram, fixture.indexFile)
      .map((symbol) => symbol.name);
    availableFixtures.push(...exports);
  });
  if (availableFixtures.length > 0) {
    mapping['fixtures/fixtures'] = availableFixtures;
  }
}

const content = { [moduleName]: mapping };

fs.writeFileSync(outputJsonPath, JSON.stringify(content, null, 2));



