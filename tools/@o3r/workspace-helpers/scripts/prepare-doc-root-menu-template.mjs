/*
 * The purpose of this script is to prepare the root menu template with the list of packages inside
 * @param compodocGlobFiles Glob to identify all compodoc configuration for packages
 * @param menuTemplateFile File path for the handlebars template menu
 * @param generatedDocOutputRegExp RegExp to remove to have the relative path of the output documentation compare to the root one
 * @param packagesVariableValueIdentifier Identifier to be replaced by the packages value
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  globby as glob,
} from 'globby';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

const findCompodocrcConfig = async (compodocGlobFiles) => {
  const files = await glob(compodocGlobFiles);
  return files.map((f) => {
    try {
      const content = fs.readFileSync(f).toString();
      const config = JSON.parse(content);
      return config;
    } catch (e) {
      // eslint-disable-next-line no-console -- output error in the console
      console.error(e);
      return;
    }
  }).filter((config) => !!config);
};

void (async () => {
  const menuTemplateFile = path.resolve(process.cwd(), argv.menuTemplateFile || 'compodoc-templates/root/partials/menu.hbs');
  const content = fs.readFileSync(menuTemplateFile).toString();
  const configs = await findCompodocrcConfig(argv.compodocGlobFiles || 'packages/@o3r/*/.compodocrc.json');
  const packages = configs.map((c) => ({
    path: c.output.replace(new RegExp(argv.generatedDocOutputRegExp || '^(\\.\\.?/)*generated-doc/'), ''),
    name: c.name
  }));
  const newContent = content.replace(argv.packagesVariableValueIdentifier || '%PACKAGES%', JSON.stringify(packages, null, 2));
  fs.writeFileSync(menuTemplateFile, newContent);
})();
