import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { addPackageJsonDependency, getPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { getPackageManagerRunner, getProjectFromTree, getTemplateFolder, readAngularJson } from '@o3r/schematics';



/**
 * Add Storybook to Otter application
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateStorybook(options: { projectName: string | null }, rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {


    const workspaceProject = getProjectFromTree(tree, options.projectName || null);
    if (!workspaceProject) {
      context.logger.warn('No project found, the update of storybook will be skipped');
      return tree;
    }
    const isLibrary = workspaceProject.projectType === 'library';

    // update gitignore
    if (tree.exists('/.gitignore')) {
      let gitignoreContent = tree.read('/.gitignore')!.toString();
      if (gitignoreContent.indexOf('/storybook-static') === -1) {
        gitignoreContent +=
          `

# Storybook
/.storybook/style.metadata.json
/documentation.json
/storybook-static
`;
        tree.overwrite('/.gitignore', gitignoreContent);
      }
    }

    // update tsconfig
    if (tree.exists('/tsconfig.json')) {
      const tsconfig: any = commentJson.parse(tree.read('/tsconfig.json')!.toString());
      if (!tsconfig.compilerOptions.lib.find((l: string) => l === 'scripthost')) {
        tsconfig.compilerOptions.lib = [...tsconfig.compilerOptions.lib, 'scripthost'];
        tree.overwrite('/tsconfig.json', commentJson.stringify(tsconfig, null, 2));
      }
    }


    let localizationMetadata = '../localisation.metadata.json';
    let configMetadata = '../component.config.metadata.json';
    let styleMetadata = '../style.metadata.json';

    // update angular.json
    const workspace = readAngularJson(tree);
    if (!workspace.projects.storybook) {
      workspace.projects.storybook = {
        projectType: 'application',
        root: '.storybook',
        sourceRoot: '.storybook',
        prefix: '',
        architect: {
          build: {
            builder: '@angular-devkit/build-angular:browser',
            options: {
              tsConfig: 'tsconfig.json',
              assets: [
                {
                  glob: '**/*',
                  input: 'node_modules/@o3r/styling/assets',
                  output: '/assets'
                }
              ]
            }
          },
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'extract-style': {
            builder: '@o3r/styling:extractor',
            options: {
              filePatterns: [
                '.storybook/styles/**/*.scss'
              ],
              outputFile: styleMetadata
            }
          }
        }
      };
      tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    }

    // register scripts
    if (tree.exists('/package.json')) {
      const packageJson = JSON.parse(tree.read('/package.json')!.toString());
      const packageManagerRunner = getPackageManagerRunner();
      packageJson.scripts = packageJson.scripts || {};
      const compodoc = packageJson.scripts['doc:generate'] ? 'doc:generate' : 'compodoc';
      packageJson.scripts['doc:json'] = packageJson.scripts['doc:json'] || `${packageManagerRunner} ${compodoc} -e json -d .`;
      packageJson.scripts.storybook = packageJson.scripts.storybook ||
        `${packageManagerRunner} doc:json && ${packageManagerRunner} cms-adapters:metadata${isLibrary ? ' && ng run storybook:extract-style' : ''} && start-storybook -p 6006`;
      packageJson.scripts['build:storybook'] = packageJson.scripts['build:storybook'] ||
        `${packageManagerRunner} doc:json && ${packageManagerRunner} cms-adapters:metadata${isLibrary ? ' && ng run storybook:extract-style' : ''} && build-storybook`;
      tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
    }

    if (!getPackageJsonDependency(tree, '@storybook/angular', '/package.json')) {
      // add dependencies
      const storybookVersion = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json')).toString()).peerDependencies['@storybook/components'];
      const currentPackageJson = JSON.parse(tree.read('/package.json')!.toString());
      const angularVersion = currentPackageJson.devDependencies['@angular/cli'];
      const sassLoaderVerion = currentPackageJson.devDependencies['sass-loader'];
      const babelLoaderVerion = currentPackageJson.devDependencies['babel-loader'];
      const storybookPresetSCSSVersion = currentPackageJson.devDependencies['@storybook/preset-scss'];
      addPackageJsonDependency(tree, { name: '@angular/localize', version: angularVersion, type: NodeDependencyType.Dev, overwrite: true });
      addPackageJsonDependency(tree, { name: '@compodoc/compodoc', version: '^1.1.11', type: NodeDependencyType.Dev, overwrite: true });
      addPackageJsonDependency(tree, { name: '@storybook/addon-actions', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/addon-docs', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/addon-essentials', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/addon-links', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/addons', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/angular', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/cli', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/builder-webpack5', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/manager-webpack5', version: storybookVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: '@storybook/preset-scss', version: storybookPresetSCSSVersion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: 'babel-loader', version: babelLoaderVerion, type: NodeDependencyType.Dev, overwrite: false });
      addPackageJsonDependency(tree, { name: 'sass-loader', version: sassLoaderVerion, type: NodeDependencyType.Dev, overwrite: false });
    }

    if (!tree.exists('.storybook/main.js')) {
      // Generate files
      Object.values(workspace.projects)
        .forEach((project) => {
          if (project.architect) {
            Object.values(project.architect)
              .forEach((build) => {
                switch (build.builder as string) {
                  case '@o3r/localization:extractor': {
                    localizationMetadata = build.options?.outputFile && `../${build.options?.outputFile as string}` || localizationMetadata;
                    break;
                  }
                  case '@o3r/components:extractor': {
                    configMetadata = build.options?.configOutputFile && `../${build.options?.configOutputFile as string}` || configMetadata;
                    break;
                  }
                  case '@o3r/styling:extractor': {
                    styleMetadata = !workspace.projects.storybook && build.options?.outputFile && `../${build.options?.outputFile as string}` || styleMetadata;
                    break;
                  }
                }
              });
          }
        });
      const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
        template({
          ...strings,
          localizationMetadata,
          configMetadata,
          styleMetadata,
          isLibrary,
          dot: '.'
        }),
        renameTemplateFiles()
      ]);

      const rule = mergeWith(templateSource, MergeStrategy.AllowCreationConflict);
      return rule(tree, context);
    }
    return tree;
  };
}
