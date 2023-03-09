import archiver from 'archiver';
import chromeWebstoreUpload from 'chrome-webstore-upload';
import { resolve } from 'node:path';
import { createWriteStream } from 'node:fs';
import * as url from 'url';

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
    console.debug(resUpload);

    store.publish().then((resPublish) => {
      console.debug(resPublish);
    }).catch((err) => {
      console.error('Failed to publish Otter Chrome Devtools', err);
    });
  }).catch((err) => {
    console.error('Failed to upload Otter Chrome Devtools', err);
  });
});

archive.directory(resolve(__dirname, '..', 'dist'), false);
archive.finalize();
