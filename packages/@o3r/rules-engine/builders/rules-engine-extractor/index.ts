import {
  existsSync,
  promises as fs,
} from 'node:fs';
import {
  dirname,
  resolve,
} from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  type CmsMetadataData,
  createBuilderWithMetricsIfInstalled,
  getLibraryCmsMetadata,
} from '@o3r/extractors';
import {
  MetadataFact,
  MetadataOperator,
  ObjectMetadataFact,
  RulesEngineExtractor,
} from './helpers';
import {
  type RulesEngineExtractorBuilderSchema,
} from './schema';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- default import not working when used inside Otter mono-repository
const globby = require('globby');

export type * from './schema';

const SCHEMA_FOLDER = 'fact-schemas';

export default createBuilder(createBuilderWithMetricsIfInstalled<RulesEngineExtractorBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();
  const outputFactsFile = resolve(context.currentDirectory, options.outputFactsDirectory, 'rules.facts.metadata.json');
  const outputOperatorsFile = resolve(context.currentDirectory, options.outputOperatorsDirectory, 'rules.operators.metadata.json');
  const basePath = dirname(outputFactsFile);
  const schemaFolder = resolve(basePath, SCHEMA_FOLDER);
  const extractor = new RulesEngineExtractor(resolve(context.currentDirectory, options.tsConfig), context.currentDirectory, context.logger);

  const metadataFiles: CmsMetadataData[] = options.libraries.map((library) => getLibraryCmsMetadata(library, context.currentDirectory));
  const rulesEngineFactsMetadataFiles = metadataFiles
    .filter((metadataFile) => !options.ignoreFactsFromLibraries.includes(metadataFile.libraryName) && !!metadataFile.rulesEngineFactsFilePath)
    .map((metadataFile) => metadataFile.rulesEngineFactsFilePath)
    .filter((rulesEngineFactsFilePath): rulesEngineFactsFilePath is string => !!rulesEngineFactsFilePath);

  const rulesEngineOperatorsMetadataFiles = metadataFiles
    .map((metadataFile) => metadataFile.rulesEngineOperatorsFilePath)
    .filter((rulesEngineOperatorsFilePath): rulesEngineOperatorsFilePath is string => !!rulesEngineOperatorsFilePath);

  const rulesEngineFactsMetadataFileWithContent: Record<string, { facts: MetadataFact[] }> = {};
  for (const file of rulesEngineFactsMetadataFiles) {
    if (existsSync(file)) {
      rulesEngineFactsMetadataFileWithContent[file] = JSON.parse(await fs.readFile(file, { encoding: 'utf8' }));
    } else {
      context.logger.warn(`File ${file} doesn't exist but referenced in the library package.json, please notify the library owner.`);
    }
  }

  const rulesEngineOperatorsMetadataFileWithContent: Record<string, { operators: MetadataOperator[] }> = {};
  for (const file of rulesEngineOperatorsMetadataFiles) {
    if (existsSync(file)) {
      rulesEngineOperatorsMetadataFileWithContent[file] = JSON.parse(await fs.readFile(file, { encoding: 'utf8' }));
    } else {
      context.logger.warn(`File ${file} doesn't exist but referenced in the library package.json, please notify the library owner.`);
    }
  }
  const librariesFacts = Object.values(rulesEngineFactsMetadataFileWithContent).reduce((acc, factsFile) => {
    acc.push(...factsFile.facts);
    return acc;
  }, [] as MetadataFact[]);
  const librariesOperators = Object.values(rulesEngineOperatorsMetadataFileWithContent).reduce((acc, operatorsFile) => {
    acc.push(...operatorsFile.operators);
    return acc;
  }, [] as MetadataOperator[]);

  // create schema folder
  try {
    await fs.mkdir(schemaFolder, { recursive: true });
  } catch {}

  // copy schema files from the libraries
  await Promise.all(
    Object.entries(rulesEngineFactsMetadataFileWithContent)
      .reduce((acc, [metadataFilePath, factsFile]) => acc.concat(
        (factsFile.facts || [])
          .filter((fact: MetadataFact): fact is ObjectMetadataFact => fact.type === 'object' && !!fact.schemaFile)
          .map(({ schemaFile }) => ({ fullPath: resolve(dirname(metadataFilePath), schemaFile!), relativePath: schemaFile! }))
      ), [] as { fullPath: string; relativePath: string }[])
      .map(({ fullPath, relativePath }) => fs.copyFile(fullPath, resolve(basePath, relativePath)))
  );

  /** Facts from the current project */
  const newFactList = (await Promise.all(
    (await Promise.all(options.factFilePatterns.map((pattern) => globby(pattern, { cwd: context.currentDirectory }))))
      .flat()
      .map((file, idx, arr) => {
        context.reportProgress(idx, arr.length, `Parsing fact from ${file}`);
        return extractor.extractFacts(resolve(context.currentDirectory, file), schemaFolder, `./${SCHEMA_FOLDER}`);
      })
  )).flat();

  /** Operators from the current project */
  const newOperatorList = (await Promise.all(options.operatorFilePatterns.map((pattern) => globby(pattern, { cwd: context.currentDirectory })))).flat()
    .flatMap((file: string, idx, arr) => {
      context.reportProgress(idx, arr.length, `Parsing operator from ${file}`);
      return extractor.extractOperators(resolve(context.currentDirectory, file));
    });

  try {
    await fs.mkdir(dirname(outputFactsFile), { recursive: true });
  } catch {}
  try {
    await fs.mkdir(dirname(outputOperatorsFile), { recursive: true });
  } catch {}
  await fs.writeFile(outputFactsFile, JSON.stringify({
    facts: [
      ...librariesFacts,
      ...newFactList
    ]
  }, null, 2));
  await fs.writeFile(outputOperatorsFile, JSON.stringify({
    operators: [
      ...librariesOperators,
      ...newOperatorList
    ]
  }, null, 2));

  return {
    success: true
  };
}));
