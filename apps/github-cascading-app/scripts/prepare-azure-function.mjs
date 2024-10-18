import {
  promises as fs
} from 'node:fs';
import {
  dirname,
  resolve
} from 'node:path';
import {
  fileURLToPath
} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

void (async () => {
  const pck = JSON.parse(await fs.readFile(resolve(__dirname, '..', 'package.json'), { encoding: 'utf-8' }));
  delete pck.devDependencies;
  delete pck.scripts;
  await fs.writeFile(resolve(__dirname, '..', 'dist', 'package.json'), JSON.stringify(pck, null, 2));
})();
