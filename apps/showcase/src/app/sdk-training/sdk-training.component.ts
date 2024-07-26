import {AsyncPipe, JsonPipe, NgComponentOutlet} from '@angular/common';
import {Component, signal, Type, ViewEncapsulation, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbAccordionModule} from '@ng-bootstrap/ng-bootstrap';
import {CopyTextPresComponent, SdkTrainingGenerationSetupExamplePresComponent, SdkTrainingGenerationSetupPresComponent, SdkTrainingStepPresComponent} from '../../components';

interface SdkTrainingStep {
  title: string,
  htmlContentUrl: string,
  htmlExampleUrl: string,
  componentExample?: Type<any>
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
  public currentStep: number = 0;
  public steps: (SdkTrainingStep & {htmlContent: WritableSignal<string>; htmlExample: WritableSignal<string>})[] = [
    {
      title: 'Welcome',
      htmlContentUrl: 'sdk-training/step-0-welcome.html',
      htmlContent: signal(''),
      htmlExampleUrl: '',
      htmlExample: signal('')
      // componentExample: SdkTrainingWelcomePresComponent
    },
    {
      title: 'Introduction',
      htmlContentUrl: 'sdk-training/step-1-introduction.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-1-introduction.example.html',
      htmlExample: signal('')
    },
    {
      title: 'HowToUseSDK',
      htmlContentUrl: 'sdk-training/step-use-sdk-1.html',
      htmlContent: signal(''),
      htmlExampleUrl: '',
      htmlExample: signal('')
    },
    {
      title: 'GenerationSetup',
      htmlContentUrl: 'sdk-training/step-2-generation-setup.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-2-generation-setup.example.html',
      htmlExample: signal(''),
      componentExample: SdkTrainingGenerationSetupPresComponent
    },
    {
      title: 'GenerationSetupExample',
      htmlContentUrl: 'sdk-training/step-3-generation-setup-exercise.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-3-generation-setup-exercise.example.html',
      htmlExample: signal(''),
      componentExample: SdkTrainingGenerationSetupExamplePresComponent
    },
    {
      title: 'GenerationConfig',
      htmlContentUrl: 'sdk-training/step-4-generation-config.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-4-generation-config.example.html',
      htmlExample: signal('')
    },
    {
      title: 'GenerationOptions',
      htmlContentUrl: 'sdk-training/step-5-generation-options.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-5-generation-options.example.html',
      htmlExample: signal('')
    },
    {
      title: 'GenerationStructure',
      htmlContentUrl: 'sdk-training/step-6-generation-structure.html',
      htmlContent: signal(''),
      htmlExampleUrl: 'sdk-training/step-6-generation-structure.example.html',
      htmlExample: signal('')
    }
  ];
  public nextStep: boolean = true;
  public previousStep: boolean = false;

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
    if (this.steps[this.currentStep] && !this.steps[this.currentStep].htmlContent()) {
      void this.loadHtml(this.steps[this.currentStep].htmlContentUrl).then((content) => this.steps[this.currentStep].htmlContent.set(content));
    }
    if (this.steps[this.currentStep] && !this.steps[this.currentStep].htmlExample()) {
      void this.loadHtml(this.steps[this.currentStep].htmlExampleUrl).then((content) => this.steps[this.currentStep].htmlExample.set(content));
    }

  }

  public async loadHtml(url: string) {
    const response = await fetch(`assets/${url}`);
    return (await response.text());
  }
}
