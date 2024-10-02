import {checkIfPathInMonacoTree, convertTreeRec} from './monaco-tree.helper';
import {MonacoTreeElement} from 'ngx-monaco-tree';
import {DirectoryNode} from '@webcontainer/api';

const tree: MonacoTreeElement[] = [{
  name: 'first-node',
  content: [{
    name: 'leaf'
  }, {
    name: 'second-node',
    content: [{
      name: 'second-leaf'
    }]
  }]
}, {
  name: 'root-leaf',
  content: undefined
}];

describe('checkIfPathInMonacoTree', () => {
  it('should return false if the tree is empty', () => {
    expect(checkIfPathInMonacoTree([], ['path'])).toBe(false);
  });
  it('should return false if the path does not match the tree at all', () => {
    expect(checkIfPathInMonacoTree(tree, ['no-match', 'leaf'])).toBe(false);

  });
  it('should return false if the path only matches part of the tree', () => {
    expect(checkIfPathInMonacoTree(tree, ['first-node','no-match'])).toBe(false);

  });
  it('should return false if the path matches a node of the tree', () => {
    expect(checkIfPathInMonacoTree(tree, ['first-node','second-node'])).toBe(false);
  });
  it('should return true if the path matches a leaf of the tree', () => {
    expect(checkIfPathInMonacoTree(tree, ['first-node','second-node', 'second-leaf'])).toBe(true);
  });
});

describe('convertTreeRec', () => {
  const directoryNode: DirectoryNode = {
    directory: {
      'myFile': {file: {contents: 'Hello world'}},
      'myFolder': {
        directory: {
          'fileInMyFolder': {
            file: {contents: 'This is a file;'}
          },
          'subFolder': {
            directory: {
              'fileInSubfolder': {
                file: {contents: 'This is a file in the subfolder'}
              }
            }
          },
          'emptySubFolder': {
            directory: {}
          }
        }
      }
    }
  };
  it('should convert a webcontainer file system object into a matching tree', () => {
    const expectedResult: MonacoTreeElement = {
      name: 'directory',
      content: [{
        name: 'myFile',
        content: undefined
      }, {
        name: 'myFolder',
        content: [{
          name: 'fileInMyFolder',
          content: undefined
        }, {
          name: 'subFolder',
          content: [{
            name: 'fileInSubfolder',
            content: undefined
          }]
        }, {
          name: 'emptySubFolder',
          content: []
        }]
      }]
    };
    const result = convertTreeRec('directory', directoryNode);
    expect(result).toStrictEqual(expectedResult);
  });
});
