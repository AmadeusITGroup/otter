import type {
  DirectoryNode,
  FileNode,
  SymlinkNode,
} from '@webcontainer/api';
import type {
  MonacoTreeElement,
} from 'ngx-monaco-tree';
import {
  isDirectoryNode,
} from '../services/webcontainer/webcontainer.helpers';

/**
 * Check if the monaco tree contains the path in parameters
 * @param tree
 * @param path
 */
export function checkIfPathInMonacoTree(tree: MonacoTreeElement[], path: string[]): boolean {
  if (path.length === 0) {
    return false;
  }
  const treeWithPath = tree.find((treeElement) => treeElement.name === path[0]);
  if (!treeWithPath) {
    return false;
  }
  return path.length === 1 ? !treeWithPath.content : checkIfPathInMonacoTree(treeWithPath.content || [], path.slice(1));
}

/**
 * Convert the given path and node to a MonacoTreeElement
 * @param path
 * @param node
 */
export function convertTreeRec(path: string, node: DirectoryNode | FileNode | SymlinkNode): MonacoTreeElement {
  return {
    name: path,
    content: isDirectoryNode(node)
      ? Object.entries(node.directory).map(([p, n]) => convertTreeRec(p, n))
      : undefined
  };
}
