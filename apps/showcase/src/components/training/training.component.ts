import {AsyncPipe, JsonPipe, NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
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

import {CopyTextPresComponent} from '../utilities/copy-text';
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

@Component({
  selector: 'o3r-training',
  standalone: true,
  imports: [
    AsyncPipe,
    CopyTextPresComponent,
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
  /**
   * Index of the training step to display
   */
  public currentStepIndex = 0;
  public showInstructions = true;
  public showSolution = false;
  /**
   * Training steps that
   */
  public steps: WritableSignal<TrainingStep[]> = signal([]);
  public stepNames = computed(() =>
    this.steps().map((step) => step.description.title)
  );
  private readonly dynamicContentService = inject(DynamicContentService);

  @Input()
  public trainingPath = '';
  @Input()
  public title = '';

  private async loadStepContent(step: TrainingStep) {
    if (!step.dynamicContent.htmlContent()) {
      void this.loadResource(step.description.htmlContentUrl).then((content) =>
        step.dynamicContent.htmlContent.set(content)
      );
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration?.urls && !step.dynamicContent.project()?.files) {
      await this.updateStepDynamicContent(step, Object.entries(fileConfiguration.urls).map(([path, url])=> ({path, url})));
    }
    if (fileConfiguration?.solutionUrls && !step.dynamicContent.solutionProject()?.files) {
      await this.updateStepDynamicContent(step, [
        ...Object.entries(fileConfiguration.urls).map(([path, url]) => ({path, url})),
        ...Object.entries(fileConfiguration.solutionUrls).map(([path, url]) => ({path, url}))
      ],
      true);
    }
  }

  private async loadSteps() {
    const program: TrainingStepDescription[] = JSON.parse(await this.loadResource(`${this.trainingPath}/program.json`));
    const stepsToLoad: TrainingStep[] = [];
    program.forEach((desc) => {
      const step = {
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
    const stepParam = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number(stepParam);
    this.setCurrentStep(stepRequested);
  }

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
        } else if (index === parsedPath.length - 1) {
          if (pointer[path]?.hasOwnProperty('file')) {
            throw new Error('Cannot override a file with a folder');
          }
          pointer[path] ||= {directory: {}};
          const pathDirectory = (pointer[path] as DirectoryNode).directory;
          const overrides = Object.entries(JSON.parse(resource.content) as {[key: string]: FileNode | DirectoryNode});
          overrides.forEach(([key, content]) =>
            pathDirectory[key] = pathDirectory[key]?.hasOwnProperty('directory') ? {...(pathDirectory[key] as DirectoryNode).directory, ...content} : content
          );
          return pathDirectory;
        } else {
          pointer[path] = pointer[path] && Object.hasOwn(pointer[path], 'directory') ? pointer[path] : {directory: {}};
          return (pointer[path] as DirectoryNode).directory;
        }
      }, fileSystemTree);
      return fileSystemTree;
    }, {} as FileSystemTree);
  }

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

  public async loadResource(url: string) {
    const resourceUrl = url.startsWith('./') ? `${this.trainingPath}/${url}` : `${url}`;
    const response = await fetch(await firstValueFrom(this.dynamicContentService.getMediaPathStream(resourceUrl)));
    return (await response.text());
  }

  public setCurrentStep(index: number) {
    if (index > this.steps().length || index < 0) {
      return;
    }
    this.currentStepIndex = index;
    let newHash;
    if (location.hash.match(/#([0-9]+)$/)) {
      newHash = location.hash.replace(/#([0-9]+)$/, `#${this.currentStepIndex}`);
    } else {
      newHash = `${location.hash}#${this.currentStepIndex}`;
    }
    history.pushState(null, '', newHash);
    this.showSolution = false;
  }

  public updateDisplayInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  public updateDisplaySolution() {
    this.showSolution = !this.showSolution;
  }
}
