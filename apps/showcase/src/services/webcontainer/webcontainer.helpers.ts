import { FileSystem, getFilesTree } from '@o3r/training-tools';
import { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { Terminal } from '@xterm/xterm';
import { BehaviorSubject } from 'rxjs';

/**
 * Get the file tree from the path of the File System of the given WebContainer instance
 * @param instance
 * @param excludedFilesOrDirectories
 * @param path
 */
export async function getFilesTreeFromContainer(instance: WebContainer, excludedFilesOrDirectories: string[] = [], path = '/') {
  return await getFilesTree([{
    path,
    isDir: true
  }], instance.fs as FileSystem, excludedFilesOrDirectories);
}

/**
 * Kill a terminal process and clear its content
 * @param terminalSubject
 * @param processSubject
 */
export function killTerminal(terminalSubject: BehaviorSubject<Terminal | null>, processSubject: BehaviorSubject<WebContainerProcess | null>) {
  processSubject.value?.kill();
  processSubject.next(null);
  terminalSubject.value?.clear();
}

/**
 * Open a writable stream on the terminal that can be bound to a process to serve as output
 * @param terminal
 * @param cb
 */
export const createTerminalStream = (terminal: Terminal, cb?: (data: string) => void | Promise<void>) => new WritableStream({
  write: (data) => {
    if (cb) {
      void cb(data);
    }
    terminal.write(data);
  }
});

/**
 * Allow a terminal to serve as an input console for a process
 * @param process
 * @param terminal
 */
export const makeProcessWritable = (process: WebContainerProcess, terminal: Terminal) => {
  const input = process.input.getWriter();
  terminal.onData((data) => {
    return input.write(data);
  });
  return input;
};
