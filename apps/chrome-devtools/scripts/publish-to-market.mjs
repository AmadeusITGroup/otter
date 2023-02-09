import archiver from 'archiver';
import chromeWebstoreUpload from 'chrome-webstore-upload';
import { resolve } from 'node:path';

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
  });
});

archive.directory(resolve(__dirname, '..', 'dist'), false);
archive.finalize();
