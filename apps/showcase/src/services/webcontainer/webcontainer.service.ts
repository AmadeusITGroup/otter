// import {Injectable} from '@angular/core';
// // import {DirectoryNode, DirEnt, FileNode, FileSystemTree, WebContainer/*, WebContainerProcess*/} from '@webcontainer/api';
// import {files} from './index';
// import {BehaviorSubject, distinctUntilChanged} from 'rxjs';
// import {MonacoTreeElement} from '../../components';
//
// class WebcContainerNotInitialized extends Error {
//   constructor() {
//     super('WebContainer not initialized');
//   }
// }
//
// const EXCLUDED_FILES_OR_DIRECTORY = ['node_modules', '.angular', '.vscode'];
//
// // const createTerminalStream = (terminal: Terminal, cb?: (data: string) => void | Promise<void>) => new WritableStream({
// //   write(data) {
// //     if (cb) {
// //       void cb(data);
// //     }
// //     terminal.write(data);
// //   }
// // });
// //
// // const makeProcessWritable = (process: WebContainerProcess, terminal: Terminal) => {
// //   const input = process.input.getWriter();
// //   terminal.onData((data) => input.write(data));
// //   return input;
// // };
//
// @Injectable({
//   providedIn: 'root'
// })
// export class WebcontainerService {
//   // private instance: WebContainer | null = null;
//   private readonly monacoTree = new BehaviorSubject<MonacoTreeElement[]>([]);
//
//   public monacoTree$ = this.monacoTree.pipe(
//     distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
//   );
//
//   private convertTreeRec(path: string, node: DirectoryNode | FileNode): MonacoTreeElement {
//     return {
//       name: path,
//       content: (node as DirectoryNode).directory
//         ? Object.entries((node as DirectoryNode).directory)
//           .map(([p, n]) => this.convertTreeRec(p, n))
//         : undefined
//     };
//   }
//
//   private async getMonacoTree(): Promise<MonacoTreeElement[]> {
//     const tree = await this.getFilesTree();
//     return Object.entries(tree)
//       .reduce(
//         (acc: MonacoTreeElement[], [path, node]) =>
//           acc.concat(this.convertTreeRec(path, node)),
//         []
//       );
//   }
//
//   // private async readDirRec(entry: DirEnt<string>, path: string): Promise<FileSystemTree | undefined> {
//   //   const entryPath = path + '/' + entry.name;
//   //   if (!this.instance) {
//   //     throw new WebcContainerNotInitialized();
//   //   }
//   //   if (entry.isDirectory()) {
//   //     if (EXCLUDED_FILES_OR_DIRECTORY.includes(entry.name)) {
//   //       return;
//   //     }
//   //     const dirEntries = await this.instance.fs.readdir(entryPath, {encoding: 'utf-8', withFileTypes: true});
//   //     const tree = {[entry.name]: {directory: {}}};
//   //     for (const subEntry of dirEntries) {
//   //       tree[entry.name].directory = {
//   //         ...tree[entry.name].directory,
//   //         ...(await this.readDirRec(subEntry, entryPath))
//   //       };
//   //     }
//   //     return tree;
//   //   }
//   //   return {
//   //     [entry.name]: {
//   //       file: {contents: await this.instance.fs.readFile(entryPath, 'utf-8')}
//   //     }
//   //   };
//   // }
//
//   private async installDeps() {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//     const installProcess = await this.instance.spawn('npm', ['install']);
//     // installProcess.output.pipeTo(createTerminalStream(terminal));
//
//     return installProcess;
//   }
//
//   private async runApp(iframe: HTMLIFrameElement) {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//     const shellProcess = await this.instance.spawn('npm', ['run', 'ng', 'run', 'tuto:serve']);
//     // shellProcess.output.pipeTo(createTerminalStream(terminal));
//     this.instance.on('server-ready', (_port: number, url: string) => {
//       iframe.src = url;
//     });
//
//     return shellProcess;
//   }
//
//   private async installThenRun(iframe: HTMLIFrameElement) {
//     const installProcess = await this.installDeps();
//     const exitCode = await installProcess.exit;
//     if (exitCode !== 0) {
//       throw new Error('Installation failed!');
//     }
//     void this.runApp(iframe);
//   }
//
//   // public async launchProject(iframe: HTMLIFrameElement, terminal: Terminal, files: any) {
//   // public async launchProject(iframe: HTMLIFrameElement) {
//   //   this.instance = await WebContainer.boot();
//   //   this.instance.on('error', console.error);
//   //   await this.instance.mount(files);
//   //   this.instance.fs.watch('/', {encoding: 'utf-8'}, async () => {
//   //     const tree = await this.getMonacoTree();
//   //     this.monacoTree.next(tree);
//   //   });
//   //   void this.installThenRun(iframe);
//   // }
//
//   public async writeFile(file: string, content: string) {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//
//     return this.instance.fs.writeFile(file, content);
//   }
//
//   public async readFile(file: string) {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//
//     return this.instance.fs.readFile(file, 'utf-8');
//   }
//
//   public async isFile(filePath: string) {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//     const parent = `${!filePath.startsWith('/') ? '/' : ''}${filePath}`
//       .split('/')
//       .slice(0, -1)
//       .join('/');
//     const fileEntries = await this.instance.fs.readdir(parent, {encoding: 'utf-8', withFileTypes: true});
//     const fileEntry = fileEntries.find((file) => filePath.split('/').pop() === file.name);
//     return !!fileEntry?.isFile();
//   }
//
//   public async startShell() {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//     const shellProcess = await this.instance.spawn('jsh');
//     void (async (data: string) => {
//       if (['CREATE', 'UPDATE', 'RENAME', 'DELETE'].some((action) => data.includes(action))) {
//         const tree = await this.getMonacoTree();
//         this.monacoTree.next(tree);
//       }
//     });
//     // shellProcess.output.pipeTo(createTerminalStream(terminal, cb));
//     // makeProcessWritable(shellProcess, terminal);
//
//     return shellProcess;
//   }
//
//   public async consoleFiles() {
//     console.log(this.getFilesTree());
//   }
//
//   public async getFilesTree() {
//     if (!this.instance) {
//       throw new WebcContainerNotInitialized();
//     }
//     const tree: FileSystemTree = {};
//     const dirEntries = await this.instance.fs.readdir('/', {encoding: 'utf-8', withFileTypes: true});
//     for (const entry of dirEntries) {
//       const subTree = await this.readDirRec(entry, '/');
//       if (subTree) {
//         tree[entry.name] = subTree[entry.name];
//       }
//     }
//     return tree;
//   }
// }
