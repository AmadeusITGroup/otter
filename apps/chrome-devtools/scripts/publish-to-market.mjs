import {
  createWriteStream,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import * as url from 'node:url';
import archiver from 'archiver';
// eslint-disable-next-line import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member -- issue with the parser on this module
import chromeWebstoreUpload from 'chrome-webstore-upload';

const logger = console;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const output = createWriteStream(resolve(__dirname, '..', 'chrome-extension.zip'));

const archive = archiver('zip');
archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

const chunks = [];
archive.on('data', (chunk) => chunks.push(chunk));
archive.on('end', () => {
  const buffer = Buffer.concat(chunks);
  const store = chromeWebstoreUpload({
    extensionId: process.env.CHROME_EXT_ID,
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN
  });
  store.uploadExisting(buffer).then((resUpload) => {
    logger.debug(resUpload);

    store.publish().then((resPublish) => {
      logger.debug(resPublish);
    }).catch((err) => {
      logger.error('Failed to publish Otter Chrome Devtools', err);
    });
  }).catch((err) => {
    logger.error('Failed to upload Otter Chrome Devtools', err);
  });
});

archive.directory(resolve(__dirname, '..', 'dist'), false);
archive.finalize();
