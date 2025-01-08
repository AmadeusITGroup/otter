import {
  DirectoryNode,
  FileNode,
  FileSystemTree,
} from '@webcontainer/api';
import {
  flattenTree,
  getFilesContent,
  isTrainingResource,
  mergeDirectories,
  overrideFileSystemTree,
} from './file-system.helper';

const sharedTrainingResource: FileSystemTree = {
  mainDirectory: {
    directory: {
      'file.ts': {
        file: {
          contents: 'This is a file'
        }
      },
      'second-file.ts': {
        file: {
          contents: 'This is the second file'
        }
      }
    }
  },
  'readme.md': {
    file: {
      contents: 'This is an untouched readme'
    }
  }
};

// eslint-disable-next-line unicorn/prefer-structured-clone -- see https://github.com/jsdom/jsdom/issues/3363
global.structuredClone = (value) => JSON.parse(JSON.stringify(value));

describe('getFilesContent', () => {
  it('should merge the resource directory into the original project', () => {
    const fileContent = getFilesContent([{
      path: './test',
      content: JSON.stringify({ fileSystemTree: sharedTrainingResource })
    }, {
      path: './test',
      content: JSON.stringify({
        fileSystemTree: {
          mainDirectory: {
            directory: {
              'third-file.ts': {
                file: {
                  contents: 'Seems like I am a new file.'
                }
              }
            }
          }
        }
      })
    }
    ]);
    expect(fileContent.test).toBeDefined();
    const files = (fileContent.test as DirectoryNode).directory;
    const filesMainDirectory = files.mainDirectory as DirectoryNode;
    expect((filesMainDirectory.directory['third-file.ts'] as FileNode).file.contents).toEqual('Seems like I am a new file.');
    expect((filesMainDirectory.directory['second-file.ts'] as FileNode).file.contents).toEqual('This is the second file');
    expect((filesMainDirectory.directory['file.ts'] as FileNode).file.contents).toEqual('This is a file');
    expect((files['readme.md'] as FileNode).file.contents).toEqual('This is an untouched readme');
  });
  it('should support `.` and `./` paths', () => {
    const fileContent = getFilesContent([{
      path: './',
      content: JSON.stringify({ fileSystemTree: sharedTrainingResource })
    }, {
      path: '.',
      content: JSON.stringify({
        fileSystemTree: {
          'other-file.ts': {
            file: {
              contents: 'File in root'
            }
          }
        }
      })
    }, {
      path: '.yarn/.',
      content: JSON.stringify({
        fileSystemTree: {
          '.yarn': {
            file: {
              contents: 'Yarn file'
            }
          }
        }
      })
    }]);
    expect((fileContent['readme.md'] as FileNode).file.contents).toEqual('This is an untouched readme');
    expect((fileContent['other-file.ts'] as FileNode).file.contents).toEqual('File in root');
    expect(((fileContent['.yarn'] as DirectoryNode).directory['.yarn'] as FileNode).file.contents).toEqual('Yarn file');
  });
});

describe('mergeDirectories', () => {
  it('should merge directories', () => {
    const originalDirectory: DirectoryNode = {
      directory: {
        'file.ts': {
          file: {
            contents: 'This is the first content'
          }
        },
        'second-file.ts': {
          file: {
            contents: 'This is the second content'
          }
        },
        'sub-folder': {
          directory: {
            'third-file.ts': {
              file: {
                contents: 'This is a file in a subfolder'
              }
            },
            'fourth-file.ts': {
              file: {
                contents: 'This is the last content'
              }
            }
          }
        }
      }
    };

    const secondDirectory: DirectoryNode = {
      directory: {
        'second-file.ts': {
          file: {
            contents: 'This is another content'
          }
        },
        'third-file.ts': {
          file: {
            contents: 'This is the third content'
          }
        },
        'sub-folder': {
          directory: {
            'fourth-file.ts': {
              file: {
                contents: 'This is no longer the last file'
              }
            },
            'fifth-file.ts': {
              file: {
                contents: 'This is the last file'
              }
            }
          }
        }
      }
    };

    const merge = mergeDirectories(originalDirectory, secondDirectory);

    expect(Object.keys(merge.directory).length).toBe(4);
    expect((merge.directory['file.ts'] as FileNode).file.contents).toEqual('This is the first content');
    expect((merge.directory['second-file.ts'] as FileNode).file.contents).toEqual('This is another content');
    expect((merge.directory['third-file.ts'] as FileNode).file.contents).toEqual('This is the third content');
    expect(((merge.directory['sub-folder'] as DirectoryNode).directory['third-file.ts'] as FileNode).file.contents).toEqual('This is a file in a subfolder');
    expect(((merge.directory['sub-folder'] as DirectoryNode).directory['fourth-file.ts'] as FileNode).file.contents).toEqual('This is no longer the last file');
    expect(((merge.directory['sub-folder'] as DirectoryNode).directory['fifth-file.ts'] as FileNode).file.contents).toEqual('This is the last file');
  });

  it('should throw if a directory is merged into a file', () => {
    const originalDirectory: DirectoryNode = {
      directory: {
        'test.ts': {
          file: {
            contents: 'SomeContent'
          }
        }
      }
    };
    const directoryToMerge: DirectoryNode = {
      directory: {
        'test.ts': {
          directory: {
            'some-file.ts': {
              file: {
                contents: 'Hello world'
              }
            }
          }
        }
      }
    };
    expect(() => {
      mergeDirectories(originalDirectory, directoryToMerge);
    }).toThrow('Cannot merge file and directory together');
  });
});

describe('overrideFileSystemTree', () => {
  it('should override a file system tree at a specific path', () => {
    const originalDirectory: FileSystemTree = {
      'file.ts': {
        file: {
          contents: 'This is the first content'
        }
      },
      'second-file.ts': {
        file: {
          contents: 'This is the second content'
        }
      },
      'sub-folder': {
        directory: {
          'third-file.ts': {
            file: {
              contents: 'This is a file in a subfolder'
            }
          },
          'fourth-file.ts': {
            file: {
              contents: 'This is the last content'
            }
          }
        }
      }
    };
    const secondDirectory: FileSystemTree = {
      'second-file.ts': {
        file: {
          contents: 'This is a new content'
        }
      },
      'third-file.ts': {
        file: {
          contents: 'We replaced the third content'
        }
      }
    };

    const merge = overrideFileSystemTree(originalDirectory, secondDirectory, ['sub-folder']);

    expect(Object.keys(merge).length).toBe(3);
    expect((merge['file.ts'] as FileNode).file.contents).toEqual('This is the first content');
    expect((merge['second-file.ts'] as FileNode).file.contents).toEqual('This is the second content');
    expect(merge['third-file.ts']).not.toBeDefined();
    expect(((merge['sub-folder'] as DirectoryNode).directory['second-file.ts'] as FileNode).file.contents).toEqual('This is a new content');
    expect(((merge['sub-folder'] as DirectoryNode).directory['third-file.ts'] as FileNode).file.contents).toEqual('We replaced the third content');
    expect(((merge['sub-folder'] as DirectoryNode).directory['fourth-file.ts'] as FileNode).file.contents).toEqual('This is the last content');
  });

  it('should throw if a directory is merged into a file', () => {
    const originalDirectory: FileSystemTree = {
      'test.ts': {
        file: {
          contents: 'SomeContent'
        }
      }
    };
    const directoryToMerge: FileSystemTree = {
      'some-file.ts': {
        file: {
          contents: 'Hello world'
        }
      }
    };

    expect(() => {
      overrideFileSystemTree(originalDirectory, directoryToMerge, ['test.ts']);
    }).toThrow('Cannot override the file test.ts with a folder');
  });
});

describe('flattenTree', () => {
  it('should flatten a file system tree into an array with path and content', () => {
    expect(
      flattenTree({
        'file.ts': {
          file: {
            contents: 'File 1'
          }
        },
        'a-folder': {
          directory: {
            'b-folder': {
              directory: {
                'b-file.ts': {
                  file: {
                    contents: 'File B'
                  }
                },
                'b2-file.ts': {
                  file: {
                    contents: 'File B2'
                  }
                }
              }
            },
            'a-file.md': {
              file: {
                contents: 'File A'
              }
            }
          }
        }
      }, '')
    ).toEqual([
      { filePath: '/file.ts', content: 'File 1' },
      { filePath: '/a-folder/b-folder/b-file.ts', content: 'File B' },
      { filePath: '/a-folder/b-folder/b2-file.ts', content: 'File B2' },
      { filePath: '/a-folder/a-file.md', content: 'File A' }
    ]);
  });
  it('should concatenate the base path to all the file path in the flattenTree', () => {
    expect(
      flattenTree({
        'a.ts': {
          file: {
            contents: 'A file'
          }
        }
      },
      './test/module')[0]
    ).toEqual({ filePath: './test/module/a.ts', content: 'A file' });
  });
});

describe('isTrainingResource', () => {
  it('should return true if the object contains a path and a content of type string', () => {
    expect(isTrainingResource({ otherProperties: 'test', path: 'some-path', content: 'the content' })).toBeTruthy();
  });
  it('should return false if the object does not contain a path and a content of type string', () => {
    expect(isTrainingResource({ otherProperties: 'test', path: 3, content: 'the content' })).toBeFalsy();
    expect(isTrainingResource({ otherProperties: 'test', path: 'some-path', content: { test: 1 } })).toBeFalsy();
    expect(isTrainingResource({ otherProperties: 'test', path: 'some-path' })).toBeFalsy();
    expect(isTrainingResource({ otherProperties: 'test', content: 'some-path' })).toBeFalsy();
    expect(isTrainingResource({ otherProperties: 'test' })).toBeFalsy();
    expect(isTrainingResource(undefined)).toBeFalsy();
    expect(isTrainingResource('hello')).toBeFalsy();
  });
});
