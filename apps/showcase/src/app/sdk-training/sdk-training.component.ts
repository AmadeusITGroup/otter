import {AsyncPipe, JsonPipe, NgComponentOutlet} from '@angular/common';
import {Component, signal, ViewEncapsulation, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {DirectoryNode, FileNode, FileSystemTree} from '@webcontainer/api';
import {CopyTextPresComponent, EditorMode, TrainingProject, TrainingStepPresComponent} from '../../components';

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
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    AsyncPipe,
    CopyTextPresComponent,
    FormsModule,
    JsonPipe,
    NgbAccordionModule,
    NgComponentOutlet,
    TrainingStepPresComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sdk-training.component.html',
  styleUrl: './sdk-training.component.scss'
})
export class SdkTrainingComponent {
  public currentStep = 0;
  public nextStep = true;
  public previousStep = false;
  public showInstructions = true;
  public showSolution = false;
  public steps: TrainingStep[] = [];
  public stepsDescription: TrainingStepDescription[] = [
    {
      title: 'Welcome',
      htmlContentUrl: 'sdk-training/step-0-welcome.html'
    },
    {
      title: 'Introduction',
      htmlContentUrl: 'sdk-training/step-1-introduction.html'
    },
    {
      title: 'How to use the Otter SDK?',
      htmlContentUrl: 'sdk-training/step-use-sdk-typescript.html'
    },
    {
      title: 'Customize your fetch client with plugins',
      htmlContentUrl: 'sdk-training/step-use-sdk-plugins.html'
    },
    {
      title: 'Integrate your component in Angular',
      htmlContentUrl: 'sdk-training/step-use-sdk-in-angular.html',
      filesConfiguration: {
        name: 'angular-integration',
        startingFile: 'apps/tutorial-app/src/app/app.component.ts',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/monorepo-template/monorepo-template.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          './libs/sdk/src': 'training-sdk/folder-structure.json'
          // eslint-disable-next-line @typescript-eslint/naming-convention
          // './libs/sdk': 'training-sdk/openapi-structure.json'
        },
        mode: 'interactive',
        commands: ['npm install --legacy-peer-deps', 'npm run ng run sdk:build', 'npm run ng run tutorial-app:serve']
      }
    },
    {
      title: 'Generate your first SDK - Specifications',
      htmlContentUrl: 'sdk-training/step-generate-sdk-specs.html',
      filesConfiguration: {
        name: 'sdk-specification',
        startingFile: 'open-api.yaml',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'training-sdk/openapi-structure.json'
        },
        mode: 'readonly',
        commands: []
      }
    },
    {
      title: 'Generate your first SDK - Command',
      htmlContentUrl: 'sdk-training/step-generate-sdk-command.html',
      filesConfiguration: {
        name: 'generate-sdk',
        startingFile: 'src/api/dummy/dummy-api.ts',
        urls: {
          'src': 'training-sdk/folder-structure.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'training-sdk/openapi-structure.json'
        },
        mode: 'readonly',
        commands: []
      }
    },
    {
      title: 'SDK with Dates - Generation',
      htmlContentUrl: 'sdk-training/step-date-generation/step-date-generation.html',
      filesConfiguration: {
        name: 'generate-date-sdk',
        startingFile: 'open-api.yaml',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/step-date-generation/step-date-generation-files.json'
        },
        solutionUrls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'training-sdk/openapi-structure.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          './src': 'training-sdk/folder-structure.json'
        },
        mode: 'readonly',
        commands: []
      }
    },
    {
      title: 'SDK with Dates - How to use',
      htmlContentUrl: 'sdk-training/step-use-date/step-use-date.html',
      filesConfiguration: {
        name: 'utils-date',
        startingFile: 'apps/tutorial-app/src/app/app.component.ts',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/monorepo-template/monorepo-template.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          './apps/tutorial-app/src/app': 'sdk-training/step-use-date/step-use-date-files.json'
        },
        solutionUrls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          './apps/tutorial-app/src/app': 'sdk-training/step-use-date/step-use-date-files-SOLUTION.json'
        },
        mode: 'interactive',
        commands: ['npm install --legacy-peer-deps', 'npm run ng run sdk:build', 'npm run ng run tutorial-app:serve']
      }
    },
    {
      title: 'SDK with Model Extension',
      htmlContentUrl: 'sdk-training/step-use-model-extension.html',
      filesConfiguration: {
        name: 'model-extension',
        startingFile: 'package.json',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/monorepo-template/monorepo-template.json'
        },
        mode: 'interactive',
        commands: ['npm install --legacy-peer-deps', 'npm run ng run sdk:build', 'npm run ng run tutorial-app:serve']
      }
    }
  ];

  constructor() {
    this.steps = this.stepsDescription.map((desc) => ({
      description: desc,
      dynamicContent: {
        htmlContent: signal(''),
        project: signal(null),
        solutionProject: signal(null)
      }
    }));
    this.steps.forEach((step) => this.loadStepContent(step));
    const stepParam = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number(stepParam);
    this.setCurrentStep(stepRequested);
  }

  private async loadStepContent(step: TrainingStep) {
    if (!step.dynamicContent.htmlContent()) {
      void this.loadResource(step.description.htmlContentUrl).then((content) =>
        step.dynamicContent.htmlContent.set(content)
      );
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration?.urls && !step.dynamicContent.project()?.files) {
      await this.updateStepDynamicContent(step, fileConfiguration.urls);
    }
    if (fileConfiguration?.solutionUrls && !step.dynamicContent.solutionProject()?.files) {
      await this.updateStepDynamicContent(step, {...fileConfiguration.urls, ...fileConfiguration.solutionUrls}, true);
    }
  }

  private getFilesContent(resources: Resource[]) {
    return resources.reduce((acc: FileSystemTree, resource) => {
      if (resource.path === './' || resource.path === '.') {
        return {...acc, ...JSON.parse(resource.content)} as FileSystemTree;
      }
      const sanitizedPath = resource.path.replace(new RegExp('^[.]/?'), '');
      const parsedPath = sanitizedPath.split('/');
      parsedPath.reduce((pointer, path, index) => {
        if (path.indexOf('.') > -1) {
          const parsedContent = JSON.parse(resource.content);
          pointer[path] = {file: {contents: parsedContent[path].file.contents}} as FileNode;
          return pointer;
        } else if (index === parsedPath.length - 1) {
          pointer[path] = {directory: JSON.parse(resource.content)} as DirectoryNode;
          return (pointer[path] as DirectoryNode).directory;
        } else {
          pointer[path] = pointer[path] && Object.hasOwn(pointer[path], 'directory') ? pointer[path] : {directory: {}};
          return (pointer[path] as DirectoryNode).directory;
        }
      }, acc);
      return acc;
    }, {} as FileSystemTree);
  }

  private async updateStepDynamicContent(step: TrainingStep, urls: {[p: string]: string}, solutionProject = false) {
    const resourcesPromise: Promise<Resource[]> = Promise.all(Object.entries(urls).map(
      async ([path, url]) => ({
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

  public setCurrentStep(index: number) {
    if (index > this.steps.length || index < 0) {
      return;
    }
    this.currentStep = index;
    history.pushState(null, '', `#/sdk-training#${this.currentStep}`);
    this.previousStep = this.currentStep > 0;
    this.nextStep = this.currentStep < this.steps.length - 1;
    if (!this.steps[this.currentStep]) {
      return;
    }
  }

  public updateDisplayInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  public updateDisplaySolution() {
    this.showSolution = !this.showSolution;
  }

  public async loadResource(url: string) {
    const response = await fetch(`assets/${url}`);
    return (await response.text());
  }
}
