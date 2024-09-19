console.log('...');
const WebContainer = require('@webcontainer/api').WebContainer;
import {FileSystem, getFilesTree} from './web-container';

const mockProjectFiles = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`,
    },
  },
};
// const expectedFileTree = {};

describe('Otter Training WebContainer', () => {
  // beforeEach(async () => {
  // });

  // TODO create test for the exported getFilesTree function
  it('should get the file tree from the given file system without the files/directories to exclude', async () => {
    const mockWebContainerInstance = await WebContainer.boot();
    await mockWebContainerInstance.mount(mockProjectFiles);
    const mockFilesTree = getFilesTree([{path: '/', isDir: false}], mockWebContainerInstance.fs as FileSystem);
    // console.log(mockFilesTree);
    if (mockFilesTree) {}
    expect(true).toBe(true);
    // compare to expected file tree
    // teardown() webcontainer instance at the end
    // mock instance if possible ?
  });
});
