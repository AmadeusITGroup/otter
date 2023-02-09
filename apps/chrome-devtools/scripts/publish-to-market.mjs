import archiver from 'archiver';
import chromeWebstoreUpload from 'chrome-webstore-upload';
import { resolve } from 'node:path';
import minimist from 'minimist';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const argv = minimist(process.argv.slice(2));

if (argv['pre-release']) {
  console.info(`No publication for pre-release version`);
  process.exit(0);
}

const archive = archiver('zip');
archive.on('error', (err) => {
  throw err;
});

const store = chromeWebstoreUpload({
  extensionId: process.env.CHROME_EXT_ID,
  clientId: process.env.CHROME_CLIENT_ID,
  refreshToken: process.env.CHROME_REFRESH_TOKEN
});
store.uploadExisting(archive).then((resUpload) => {
  console.debug(resUpload);

  store.publish.then((resPublish) => {
    console.debug(resPublish);
  }).catch((err) => {
    console.error('Failed to publish Otter Chrome Devtools', err);
  });
}).catch((err) => {
  console.error('Failed to upload Otter Chrome Devtools', err)
});

archive.directory(resolve(__dirname, '..', 'dist'), false);
archive.finalize();
