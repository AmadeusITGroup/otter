import {Component, signal, ViewEncapsulation} from '@angular/core';
import {CopyTextPresComponent, SdkTrainingStepPresComponent,} from '../../components';
import {AsyncPipe, JsonPipe} from "@angular/common";

@Component({
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    AsyncPipe,
    CopyTextPresComponent,
    SdkTrainingStepPresComponent,
    JsonPipe
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sdk-training.component.html',
  styleUrl: './sdk-training.component.scss'
})
export class SdkTrainingComponent {
  public currentStep: number;
  public steps: any[] = [{
    title: 'Introduction',
    htmlContentUrl: 'sdk-training/step-1.html',
    htmlContent: signal(''),
    htmlExampleUrl: 'sdk-training/step-1.example.html',
    htmlExample: signal('')
  }];
  public nextStep: boolean;
  public previousStep: boolean;

  constructor() {
    const stepRequested = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    this.currentStep = !stepRequested || Number.isNaN(stepRequested) ? 0 : Number.parseInt(stepRequested);
    this.previousStep = this.currentStep > 0;
    this.nextStep = this.currentStep < this.steps.length - 1;
    if (this.steps[this.currentStep] && !this.steps[this.currentStep].htmlContent()) {
      void this.loadHtml(this.steps[this.currentStep].htmlContentUrl).then((content) => this.steps[this.currentStep].htmlContent.set(content));
    }
    if (this.steps[this.currentStep] && !this.steps[this.currentStep].htmlExample()) {
      void this.loadHtml(this.steps[this.currentStep].htmlExampleUrl).then((content) => this.steps[this.currentStep].htmlExample.set(content));
    }
  }

  public goToNextStep() {
    if (this.currentStep > 6) {
      return;
    }
    this.currentStep++;
    this.previousStep = this.currentStep > 0;
    this.nextStep = this.currentStep < this.steps.length - 1;
    history.pushState(null, '', `#/sdk-training#${this.currentStep}`);
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

  public goToPreviousStep() {
    if (this.currentStep < 0) {
      return;
    }
    this.currentStep--;
    this.previousStep = this.currentStep !== 0;
    this.nextStep = this.currentStep !== 6;
    if (this.steps[this.currentStep] && this.steps[this.currentStep].htmlContent()) {
      void this.loadHtml(this.steps[this.currentStep].htmlContentUrl).then((content) => this.steps[this.currentStep].htmlContent.set(content));
    }
    if (this.steps[this.currentStep] && this.steps[this.currentStep].htmlExample()) {
      void this.loadHtml(this.steps[this.currentStep].htmlExampleUrl).then((content) => this.steps[this.currentStep].htmlExample.set(content));
    }
    history.pushState(null, '', `#/sdk-training#${this.currentStep}`);
  }
}
