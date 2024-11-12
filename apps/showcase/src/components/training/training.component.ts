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
import {DirectoryNode, FileNode, FileSystemTree} from '@webcontainer/api';
import {firstValueFrom} from 'rxjs';
import {EditorMode, TrainingProject} from './code-editor-view';
import {TrainingStepPresComponent} from './training-step';

/** Description of training step */
interface TrainingStepDescription {
  /** Step title */
  title: string;
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
    urls: { [key: string]: string };
    /** URLs of step solution project */
    solutionUrls?: { [key: string]: string };
    /** Mode of the Code Editor */
    mode: EditorMode;
  };
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
    this.steps().map((step) => step.description.title)
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
      step.dynamicContent.htmlContent.set(content);
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration?.urls && !step.dynamicContent.project()?.files) {
      await this.updateStepDynamicContent(step, Object.entries(fileConfiguration.urls).map(([path, url])=> ({path, url})));
    }
    if (fileConfiguration?.urls && fileConfiguration?.solutionUrls && !step.dynamicContent.solutionProject()?.files) {
      await this.updateStepDynamicContent(step, [
        ...Object.entries(fileConfiguration.urls).map(([path, url]) => ({path, url})),
        ...Object.entries(fileConfiguration.solutionUrls).map(([path, url]) => ({path, url}))
      ],
      true);
    }
  }

  /**
   * Load the training steps, including their description and dynamic content
   */
  private async loadSteps() {
    const program: TrainingStepDescription[] = JSON.parse(await this.loadResource(`${this.trainingPath()}/program.json`));
    const stepsToLoad: TrainingStep[] = [];
    program.forEach((desc) => {
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
   * Convert the resources into a file system tree
   * @param resources Training step resources including their paths and content
   */
  private getFilesContent(resources: Resource[]) {
    return resources.reduce((fileSystemTree: FileSystemTree, resource) => {
      if (resource.path === './' || resource.path === '.') {
        return {...fileSystemTree, ...JSON.parse(resource.content)} as FileSystemTree;
      }
      const sanitizedPath = resource.path.replace(new RegExp('^[.]/?'), '');
      const parsedPath = sanitizedPath.split('/');
      parsedPath.reduce((pointer, path, index) => {
        if (path.indexOf('.') > -1) {
          const parsedContent = JSON.parse(resource.content);
          pointer[path] = {file: {contents: parsedContent[path].file.contents}} as FileNode;
          return pointer;
        }
        if (index === parsedPath.length - 1) {
          if (pointer[path] && 'file' in pointer[path]) {
            throw new Error('Cannot override a file with a folder');
          }
          pointer[path] ||= {directory: {}};
          const pathDirectory = (pointer[path]).directory;
          const overrides = Object.entries(JSON.parse(resource.content) as {[key: string]: FileNode | DirectoryNode});
          overrides.forEach(([key, content]) =>
            pathDirectory[key] = (pathDirectory[key] && 'directory' in pathDirectory[key])
              ? {...(pathDirectory[key]).directory, ...content}
              : content
          );
          return pathDirectory;
        }
        pointer[path] = pointer[path] && 'directory' in pointer[path] ? pointer[path] : {directory: {}};
        return (pointer[path]).directory;
      }, fileSystemTree);
      return fileSystemTree;
    }, {} as FileSystemTree);
  }

  /**
   * Load the resource using the provided URL
   * @param url
   */
  private async loadResource(url: string) {
    const resourceUrl = url.startsWith('./') ? `${this.trainingPath()}/${url.substring(2)}` : url;
    const response = await fetch(await firstValueFrom(this.dynamicContentService.getMediaPathStream(resourceUrl)));
    return response.text();
  }

  /**
   * Update the dynamic content of the specified training step
   * @param step Training step
   * @param urls URLs of the step project or solution project
   * @param solutionProject Boolean indicating if the dynamic content is the project or solution project of the step
   */
  private async updateStepDynamicContent(step: TrainingStep, urls: { url: string; path: string }[], solutionProject = false) {
    const resourcesPromise: Promise<Resource[]> = Promise.all(urls.map(
      async ({path, url}) => ({
        path,
        content: await this.loadResource(url)
      })
    ));
    const resources = await resourcesPromise;
    const filesContent = this.getFilesContent(resources);
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
