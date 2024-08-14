import {AsyncPipe, JsonPipe, NgComponentOutlet} from '@angular/common';
import {Component, signal, ViewEncapsulation, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {DirectoryNode, FileNode, FileSystemTree} from '@webcontainer/api';
// import {JSONPath} from 'jsonpath-plus';
import {
  CopyTextPresComponent,
  SdkTrainingGenerationSetupExamplePresComponent,
  SdkTrainingGenerationSetupPresComponent,
  SdkTrainingStepPresComponent
} from '../../components';

interface SdkTrainingStepConfig {
  title: string;
  htmlContentUrl: string;
  htmlExampleUrl?: string;
  filesConfiguration?: {
    startingFile: string;
    commands: string[];
    urls: { [key: string]: string };
    mode: 'readonly' | 'interactive';
    runApp: boolean;
  };
}

type SdkTrainingStep = {
  description: SdkTrainingStepConfig;
  dynamicContent: {
    htmlContent: WritableSignal<string>;
    htmlExample: WritableSignal<string>;
    fileContent: WritableSignal<FileSystemTree | null>;
  };
};

@Component({
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    NgComponentOutlet,
    AsyncPipe,
    CopyTextPresComponent,
    FormsModule,
    NgbAccordionModule,
    SdkTrainingGenerationSetupExamplePresComponent,
    SdkTrainingGenerationSetupPresComponent,
    SdkTrainingStepPresComponent,
    JsonPipe
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sdk-training.component.html',
  styleUrl: './sdk-training.component.scss'
})
export class SdkTrainingComponent {
  public currentStep = 0;
  public showInstructions = true;
  public steps: SdkTrainingStep[] = [];
  public stepsDescription: SdkTrainingStepConfig[] = [
    {
      title: 'Welcome',
      htmlContentUrl: 'sdk-training/step-0-welcome.html'
    },
    {
      title: 'Introduction',
      htmlContentUrl: 'sdk-training/step-1-introduction.html',
      htmlExampleUrl: 'sdk-training/step-1-introduction.example.html'
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
        startingFile: 'apps/tuto-app/src/app/app.component.ts',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/step-generate-sdk-specs/empty.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          './libs/sdk/src': 'training-sdk/folder-structure.json'
          // eslint-disable-next-line @typescript-eslint/naming-convention
          // './libs/sdk': 'training-sdk/openapi-structure.json'
        },
        mode: 'interactive',
        commands: ['npm install', 'npm run ng run sdk:build', 'npm run ng run tuto-app:serve'],
        runApp: false
      }
    },
    {
      title: 'Generate your first SDK - Specifications',
      htmlContentUrl: 'sdk-training/step-generate-sdk-specs.html',
      filesConfiguration: {
        startingFile: 'open-api.yaml',
        urls: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'training-sdk/openapi-structure.json'
        },
        mode: 'readonly',
        commands: [],
        runApp: false
      }
    },
    {
      title: 'Generate your first SDK - Command',
      htmlContentUrl: 'sdk-training/step-generate-sdk-command.html',
      htmlExampleUrl: 'sdk-training/step-generate-sdk-command.example.html',
      filesConfiguration: {
        startingFile: 'src/api/dummy/dummy-api.ts',
        urls: {
          'src': 'training-sdk/folder-structure.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'training-sdk/openapi-structure.json'
        },
        mode: 'readonly',
        commands: [],
        runApp: false
      }
    },
    {
      title: 'SDK with Dates',
      htmlContentUrl: 'sdk-training/step-use-date.html',
      htmlExampleUrl: 'sdk-training/step-use-date.example.html',
      filesConfiguration: {
        startingFile: 'package.json',
        // startingFile: 'src/models/base/flight/flight.ts',
        urls: {
          // 'src': 'training-sdk/folder-structure.json',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '.': 'sdk-training/step-use-date/step-use-date-files.json'
          // '.': 'training-sdk/openapi-structure.json'
        },
        mode: 'interactive',
        commands: [],
        runApp: false
      }
    },
    {
      title: 'SDK with Model Extension',
      htmlContentUrl: 'sdk-training/step-use-model-extension.html'
    }
  ];
  public nextStep = true;
  public previousStep = false;

  constructor() {
    this.steps = this.stepsDescription.map((desc) => ({
      description: desc,
      dynamicContent: {
        htmlContent: signal(''),
        htmlExample: signal(''),
        fileContent: signal(null)
      }
    }));
    this.steps.forEach((step) => this.loadStepContent(step));
    const stepParam = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number.parseInt(stepParam);
    this.setCurrentStep(stepRequested);
  }

  private loadStepContent(step: SdkTrainingStep) {
    if (!step.dynamicContent.htmlContent()) {
      void this.loadResource(step.description.htmlContentUrl).then((content) =>
        step.dynamicContent.htmlContent.set(content)
      );
    }
    if (step.description.htmlExampleUrl && !step.dynamicContent.htmlExample()) {
      void this.loadResource(step.description.htmlExampleUrl).then((content) =>
        step.dynamicContent.htmlExample.set(content));
    }
    const fileConfiguration = step.description.filesConfiguration;
    if (fileConfiguration && fileConfiguration.urls && !step.dynamicContent.fileContent()) {
      const resourcesPromise = Promise.all(Object.entries(fileConfiguration.urls).map(
        async ([path, url]) => ({
          path,
          content: await this.loadResource(url)
        })
      ));
      void resourcesPromise.then((resources) => {
        const filesContent = resources.reduce((acc: FileSystemTree, resource) => {
          // eslint-disable-next-line new-cap
          const path = resource.path;
          const content = resource.content;
          if (path === './' || path === '.') {
            return {...acc, ...JSON.parse(content)} as FileSystemTree;
          }
          const sanitizedPath = path.replace(new RegExp('^[.]/?'), '');
          const parsedPath = sanitizedPath.split('/');
          parsedPath.reduce((pointer, path, index) => {
            if (path.indexOf('.') > -1) {
              pointer[path] = {file: {contents: content}} as FileNode;
              return pointer;
            } else if (index === parsedPath.length - 1) {
              pointer[path] = {directory: JSON.parse(content)} as DirectoryNode;
              return (pointer[path] as DirectoryNode).directory;
            } else {
              pointer[path] = pointer[path] && Object.hasOwn(pointer[path], 'directory') ? pointer[path] : {directory: {}};
              return (pointer[path] as DirectoryNode).directory;
            }
          }, acc);
          return acc;
        }, {} as FileSystemTree);
        step.dynamicContent.fileContent.set(filesContent);
      });
    }

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

  public async loadResource(url: string) {
    const response = await fetch(`assets/${url}`);
    return (await response.text());
  }
}
