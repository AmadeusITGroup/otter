import {AsyncPipe, JsonPipe, NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle
} from '@ng-bootstrap/ng-bootstrap';
import {DynamicContentModule, DynamicContentService} from '@o3r/dynamic-content';
import type {DirectoryNode, FileNode, FileSystemTree, SymlinkNode} from '@webcontainer/api';
import {firstValueFrom} from 'rxjs';
import {EditorMode, TrainingProject} from './code-editor-view';
import {TrainingStepPresComponent} from './training-step';

/** Step project content and its corresponding path */
interface StepProjectUrl {
  /** Path in step project */
  path: string;
  /** URL of content */
  contentUrl: string;
}

/** Description of training step */
interface TrainingStepDescription {
  /** Step title */
  stepTitle: string;
  /** URL to step instructions (HTML content) */
  htmlContentUrl: string;
  /** Step files configuration */
  filesConfiguration?: {
    /** Name of directory in which files will be put */
    name: string;
    /** Starting file to be displayed in the project */
    startingFile: string;
    /** Commands to run in the project */
    commands: string[];
    /** URLs of step project */
    urls: StepProjectUrl[];
    /** URLs of step solution project */
    solutionUrls?: StepProjectUrl[];
    /** Mode of the Code Editor */
    mode: EditorMode;
  };
}

/** Training program */
interface TrainingProgram {
  /** Steps of the training program */
  trainingSteps: TrainingStepDescription[];
}

/** Training step - consists of its description and its dynamic content */
type TrainingStep = {
  /** Description of the training step */
  description: TrainingStepDescription;
  /** Dynamic content of the training step */
  dynamicContent: {
    /** HTML Content - corresponds to the step instructions */
    htmlContent: WritableSignal<string>;
    /** Exercise project of the step */
    project: WritableSignal<TrainingProject | null>;
    /** Solution of the exercise project of the step */
    solutionProject: WritableSignal<TrainingProject | null>;
  };
};

/** Resources to get file content */
type Resource = {
  /** Resource path */
  path: string;
  /** Resource content */
  content: string;
};

/** RegExp of current step index at the end of the location URL (example: http://url/#/fragment#3) */
const currentStepLocationRegExp = new RegExp(/#([0-9]+)$/);

/**
 * Node is of type FileNode
 * @param node Node from FileSystemTree
 */
const isFileNode = (node: DirectoryNode | FileNode | SymlinkNode): node is FileNode | SymlinkNode => !!(node as FileNode).file;

/**
 * Deep merge of directories
 * @param dirBase Base directory
 * @param dirOverride Directory to override base
 */
const mergeDirectories = (dirBase: DirectoryNode, dirOverride: DirectoryNode): DirectoryNode => {
  const merge = structuredClone(dirBase);
  Object.entries(dirOverride.directory).forEach(([path, node]) => {
    const baseNode = merge.directory[path];
    if (!baseNode || (isFileNode(node) && isFileNode(baseNode))) {
      // Not present in base directory
      // Or present in both as file
      merge.directory[path] = node;
    } else if (!isFileNode(node) && !isFileNode(baseNode)) {
      // Present in both as directory
      merge.directory[path] = mergeDirectories(baseNode, node);
    } else {
      throw new Error('Cannot merge file and directory together');
    }
  });
  return merge;
};

/**
 * Predicate to check if fileSystem can be typed as a `DirectoryNode`
 * @param fileSystem
 */
const isDirectory = (fileSystem: DirectoryNode | FileNode | SymlinkNode): fileSystem is DirectoryNode => {
  return 'directory' in fileSystem;
};

/**
 * Merge a sub file system into another
 * @param fileSystemTree Original file system.
 * @param fileSystemOverride File system that should be merged with the original. Its files take precedence over the original one.
 * @param path Location in mergeFolder where fileSystemOverride should be merged.
 */
function overrideFileSystemTree(fileSystemTree: FileSystemTree, fileSystemOverride: FileSystemTree, path: string[]): FileSystemTree {
  const key = path.shift() as string;
  const target = fileSystemTree[key] || { directory: {} };
  if (path.length === 0 && isDirectory(target)) {
    // Exploration of file system is done, we can merge the directories
    fileSystemTree[key] = mergeDirectories(target, { directory: fileSystemOverride });
  } else if (isDirectory(target)) {
    fileSystemTree[key] = {
      directory: {
        ...target.directory,
        ...overrideFileSystemTree(target.directory, fileSystemOverride, path)
      }
    };
  } else {
    throw new Error(`Cannot override the file ${key} with a folder`);
  }
  return fileSystemTree;
}

/**
 * Generate a file system tree composed of the deep merge of all the resources passed in parameters
 * @param resources Sorted list of path and content to load. If a file is defined several time, the last occurrence
 * overrides the others
 */
function getFilesContent(resources: Resource[]) {
  return (resources.reduce((fileSystemTree: FileSystemTree, resource) => {
    const sanitizedPath = `./${resource.path.replace(new RegExp('^[.]/?'), '')}`;
    const parsedPath = sanitizedPath.split('/').filter((pathEl) => !!pathEl);
    overrideFileSystemTree(fileSystemTree, JSON.parse(resource.content) as FileSystemTree, parsedPath);
    return fileSystemTree;
  }, {} as FileSystemTree)['.'] as DirectoryNode).directory;
}


@Component({
  selector: 'o3r-training',
  standalone: true,
  imports: [
    AsyncPipe,
    DynamicContentModule,
    FormsModule,
    JsonPipe,
    NgbAccordionModule,
    NgComponentOutlet,
    TrainingStepPresComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './training.component.html',
  styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit {
  /** Index of the training step to display */
  public currentStepIndex = signal(0);
  /** Display exercise solution */
  public showSolution = signal(false);
  /** Training steps */
  public steps = signal<TrainingStep[]>([]);
  /** Training step names for the dropdown menu */
  public stepNames = computed(() =>
    this.steps().map((step) => step.description.stepTitle)
  );

  /** Path to the training assets */
  public trainingPath = input('');
  /** Title of the training */
  public title = input('');

  private readonly dynamicContentService = inject(DynamicContentService);

  /**
   * Load the dynamic content of the specified training step
   * @param step
   */
  private async loadStepContent(step: TrainingStep) {
    if (!step.dynamicContent.htmlContent()) {
      const content = await this.loadResource(step.description.htmlContentUrl);
      if (!content) {
        // eslint-disable-next-line no-console
        console.error('No step found');
        return;
      }
      step.dynamicContent.htmlContent.set(content);
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration?.urls && !step.dynamicContent.project()?.files) {
      await this.updateStepDynamicContent(step, fileConfiguration.urls);
    }
    if (fileConfiguration?.urls && fileConfiguration?.solutionUrls && !step.dynamicContent.solutionProject()?.files) {
      await this.updateStepDynamicContent(step, [
        ...fileConfiguration.urls,
        ...fileConfiguration.solutionUrls
      ],
      true);
    }
  }

  /**
   * Load the training steps, including their description and dynamic content
   */
  private async loadSteps() {
    const programFiles = await this.loadResource(`${this.trainingPath()}/program.json`);
    if (!programFiles) {
      // eslint-disable-next-line no-console
      console.error('No training program found');
      return;
    }
    const program = JSON.parse(programFiles) as TrainingProgram;
    const stepsToLoad: TrainingStep[] = [];
    program.trainingSteps.forEach((desc) => {
      const step: TrainingStep = {
        description: desc,
        dynamicContent: {
          htmlContent: signal(''),
          project: signal(null),
          solutionProject: signal(null)
        }
      };
      void this.loadStepContent(step);
      stepsToLoad.push(step);
    });
    this.steps.set(stepsToLoad);
    const stepParam = window.location.href.match(currentStepLocationRegExp)?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number(stepParam);
    this.setCurrentStep(stepRequested);
  }

  /**
   * Load the resource using the provided URL
   * @param url
   */
  private async loadResource(url: string) {
    const resourceUrl = url.startsWith('./') ? `${this.trainingPath()}/${url.substring(2)}` : url;
    const response = await fetch(await firstValueFrom(this.dynamicContentService.getMediaPathStream(resourceUrl)));
    return response.ok ? response.text() : undefined;
  }

  /**
   * Update the dynamic content of the specified training step
   * @param step Training step
   * @param urls URLs of the step project or solution project
   * @param solutionProject Boolean indicating if the dynamic content is the project or solution project of the step
   */
  private async updateStepDynamicContent(step: TrainingStep, urls: StepProjectUrl[], solutionProject = false) {
    const resources = (await Promise.all(
      urls.map(
        async ({path, contentUrl}) => ({
          path,
          content: await this.loadResource(contentUrl)
        })
      ))).filter((resource): resource is Resource => !!resource.content);
    const filesContent = getFilesContent(resources);
    step.dynamicContent[solutionProject ? 'solutionProject' : 'project'].set({
      startingFile: step.description.filesConfiguration!.startingFile || '',
      commands: step.description.filesConfiguration!.commands || [],
      files: filesContent,
      cwd: step.description.filesConfiguration!.name.toLowerCase().replace(' ', '-') + (solutionProject ? '-solution' : '')
    });
  }

  public ngOnInit() {
    void this.loadSteps();
  }

  /**
   * Set the current step index. Also update the browser URL and history.
   * @param index
   */
  public setCurrentStep(index: number) {
    if (index > this.steps().length || index < 0) {
      return;
    }
    this.currentStepIndex.set(index);

    const newHash = location.hash.match(currentStepLocationRegExp)
      ? location.hash.replace(currentStepLocationRegExp, `#${this.currentStepIndex()}`)
      : `${location.hash}#${this.currentStepIndex()}`;
    history.pushState(null, '', newHash);
    this.showSolution.set(false);
  }

  /**
   * Update the display of the exercise solution and the corresponding button label
   */
  public toggleDisplaySolution() {
    this.showSolution.set(!this.showSolution());
  }
}
