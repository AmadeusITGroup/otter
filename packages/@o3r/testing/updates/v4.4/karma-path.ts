import { DirEntry, FileEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

/**
 * @param memory
 * @param directory
 * @param fileMatchesCriteria
 * @param ignoreDirectories
 */
function findFilenameInTree(memory: Set<FileEntry>, directory: DirEntry, fileMatchesCriteria: (file: string) => boolean, ignoreDirectories: string[] = ['node_modules']) {
  if (ignoreDirectories.some((dir) => directory.path.indexOf(dir) > -1)) {
    return memory;
  }

  directory.subfiles
    .filter(fileMatchesCriteria)
    .forEach((file) => memory.add(directory.file(file)!));

  directory.subdirs
    .forEach((dir) => findFilenameInTree(memory, directory.dir(dir), fileMatchesCriteria, ignoreDirectories));

  return memory;
}

/**
 * Update Karma path in the tsconfig files
 */
export function updateKarmaPath(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    Array.from(findFilenameInTree(new Set<FileEntry>(), tree.getDir('/'), (file) => file.startsWith('tsconfig') && file.endsWith('.json')))
      .forEach((file) => {
        const content = JSON.parse(file.content.toString('utf8'));
        if (content.compilerOptions && content.compilerOptions.paths) {
          Object.keys(content.compilerOptions.paths)
            .filter((pathName) => pathName.startsWith('@o3r/testing/core'))
            .forEach((pathName) => {
              content.compilerOptions.paths[pathName] = content.compilerOptions.paths[pathName]
                .map((pathTarget: string) => pathTarget.replace('testing/core/karma', 'testing/core/angular'));
              tree.overwrite(file.path, JSON.stringify(content, null, 2));
            });
        }
      });

    return tree;
  };
}
