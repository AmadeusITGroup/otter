import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getTemplateFolder } from '../../utility/loaders';

/**
 * Add Otter registries in npmrc
 *
 * @param options @see RuleFactory.options
 * @param _options
 * @param _options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updateNpmrcRegistry(_options: { projectName: string | null }, rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const registries = [
      '@otter:registry=https://pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/',
      '@dapi:registry=https://pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/',
      // eslint-disable-next-line max-len
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/:username=AmadeusDigitalAirline',
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/:_password=cW40bnducWFobjV6bnh5eXNrZ2tzYWM1eGJ1Z21xeXd5MnB6a203Z2p3aWhvd21saDZuYQ==',
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter/npm/registry/:email=noreply@amadeus.com',
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/:username=AmadeusDigitalAirline',
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/:_password=cW40bnducWFobjV6bnh5eXNrZ2tzYWM1eGJ1Z21xeXd5MnB6a203Z2p3aWhvd21saDZuYQ==',
      '//pkgs.dev.azure.com/AmadeusDigitalAirline/DES-SDKs/_packaging/des-sdks/npm/registry/:email=noreply@amadeus.com',
      'always-auth=true'
    ];

    const npmrcExists = tree.exists('/.npmrc');
    const currentNpmrc: string[] = npmrcExists ? (tree.read('/.npmrc') || '').toString().split(/[\n\r]/g) : [];

    // TODO* workaround for issue https://github.com/angular/angular-cli/issues/11337
    if (npmrcExists) {
      tree.delete('/.npmrc');
    }

    registries.forEach((registry) => {
      const registryKey = registry.split('=')[0];
      const line = currentNpmrc.find((currentRegistry) => new RegExp(`^${registryKey}`).test(currentRegistry.replace(/ /g, '')));
      if (!line) {
        currentNpmrc.push(registry);
      }
    });

    const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
      template({
        ...strings,
        registries: currentNpmrc.filter((reg) => !!reg),
        empty: ''
      })
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
    return rule(tree, context);
  };
}
