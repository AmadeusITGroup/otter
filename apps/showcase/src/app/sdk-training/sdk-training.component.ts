import { AsyncPipe, JsonPipe, NgComponentOutlet } from '@angular/common';
import { Component, signal, Type, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { FileSystemTree } from '@webcontainer/api';
import {
  CopyTextPresComponent,
  EditorMode,
  SdkTrainingGenerationSetupExamplePresComponent,
  SdkTrainingGenerationSetupPresComponent,
  SdkTrainingStepPresComponent
} from '../../components';

interface SdkTrainingStep {
  title: string;
  htmlContentUrl: string;
  htmlExampleUrl: string;
  componentExample?: Type<any>;
}

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
  public steps: (SdkTrainingStep & {
    htmlContent: WritableSignal<string>;
    htmlExample: WritableSignal<string>;
    filesConfiguration?: {
      startingFile: string;
      link?: string;
      commands?: string[],
      filesContent: WritableSignal<FileSystemTree | null>;
      mode?: EditorMode;
    };
  })[] = [
      {
        title: 'Welcome',
        htmlContentUrl: 'sdk-training/step-0-welcome.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal('')
      },
      {
        title: 'Introduction',
        htmlContentUrl: 'sdk-training/step-1-introduction.html',
        htmlContent: signal(''),
        htmlExampleUrl: 'sdk-training/step-1-introduction.example.html',
        htmlExample: signal('')
      },
      {
        title: 'How to use the Otter SDK?',
        htmlContentUrl: 'sdk-training/step-use-sdk-typescript.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal('')
      },
      {
        title: 'Customize your fetch client with plugins',
        htmlContentUrl: 'sdk-training/step-use-sdk-plugins.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal('')
      },
      {
        title: 'Integrate your component in Angular',
        htmlContentUrl: 'sdk-training/step-use-sdk-in-angular.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal(''),
        filesConfiguration: {
          startingFile: 'apps/tuto/src/index.html',
          link: 'sdk-training/step-generate-sdk-specs/step-generate-sdk-specs-files.json',
          mode: 'interactive',
          commands: ['install', 'ng run tuto:serve'],
          filesContent: signal(null)
        }
      },
      {
        title: 'Generate your first SDK - Specifications',
        htmlContentUrl: 'sdk-training/step-generate-sdk-specs.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal(''),
        filesConfiguration: {
          startingFile: 'open-api.yaml',
          link: 'training-sdk/openapi-structure.json',
          filesContent: signal(null)
        }
      },
      {
        title: 'Generate your first SDK - Command',
        htmlContentUrl: 'sdk-training/step-generate-sdk-command.html',
        htmlContent: signal(''),
        htmlExampleUrl: 'sdk-training/step-generate-sdk-command.example.html',
        htmlExample: signal(''),
        filesConfiguration: {
          startingFile: 'api/dummy/dummy-api.ts',
          link: 'training-sdk/folder-structure.json',
          filesContent: signal(null),
          mode: 'readonly'
        }
      },
      {
        title: 'SDK with Dates',
        htmlContentUrl: 'sdk-training/step-use-date.html',
        htmlContent: signal(''),
        htmlExampleUrl: 'sdk-training/step-use-date.example.html',
        htmlExample: signal('')
      },
      {
        title: 'SDK with Model Extension',
        htmlContentUrl: 'sdk-training/step-use-model-extension.html',
        htmlContent: signal(''),
        htmlExampleUrl: '',
        htmlExample: signal('')
      }
    ];
  public nextStep = true;
  public previousStep = false;

  constructor() {
    const stepParam = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    const stepRequested = !stepParam || Number.isNaN(stepParam) ? 0 : Number.parseInt(stepParam);
    this.setCurrentStep(stepRequested);
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
    if (!this.steps[this.currentStep].htmlContent()) {
      void this.loadResource(this.steps[this.currentStep].htmlContentUrl).then((content) => this.steps[this.currentStep].htmlContent.set(content));
    }
    if (!this.steps[this.currentStep].htmlExample()) {
      void this.loadResource(this.steps[this.currentStep].htmlExampleUrl).then((content) => this.steps[this.currentStep].htmlExample.set(content));
    }
    const fileConfiguration = this.steps[this.currentStep].filesConfiguration;
    if (fileConfiguration && fileConfiguration.link && !fileConfiguration.filesContent()) {
      void this.loadResource(fileConfiguration.link).then((content) =>
        fileConfiguration.filesContent.set(JSON.parse(content))
      );
    }

  }

  public async loadResource(url: string) {
    const response = await fetch(`assets/${url}`);
    return (await response.text());
  }
}
