import { Component } from '@angular/core';
import {
  CopyTextPresComponent,
  SdkTrainingGenerationConfigPresComponent,
  SdkTrainingGenerationOptionsPresComponent,
  SdkTrainingGenerationSetupExamplePresComponent,
  SdkTrainingGenerationSetupPresComponent,
  SdkTrainingGenerationStructurePresComponent,
  SdkTrainingIntroPresComponent,
  SdkTrainingWelcomePresComponent
} from '../../components';

@Component({
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    CopyTextPresComponent,
    SdkTrainingGenerationConfigPresComponent,
    SdkTrainingGenerationOptionsPresComponent,
    SdkTrainingGenerationSetupExamplePresComponent,
    SdkTrainingGenerationSetupPresComponent,
    SdkTrainingGenerationStructurePresComponent,
    SdkTrainingIntroPresComponent,
    SdkTrainingWelcomePresComponent
  ],
  templateUrl: './sdk-training.component.html',
  styleUrl: './sdk-training.component.scss'
})
export class SdkTrainingComponent {
  public previousStep: boolean = true;
  public nextStep: boolean = true;
  public currentStep: number;
  constructor () {
    const stepRequested = window.location.href.match(new RegExp('#([0-9]+)'))?.[1];
    this.currentStep = !stepRequested || Number.isNaN(stepRequested) ? 0 : Number.parseInt(stepRequested);
  }

  public goToNextStep() {
    if (this.currentStep > 6) {
      return;
    }
    this.currentStep++;
    this.previousStep = this.currentStep !== 0;
    this.nextStep = this.currentStep !== 6;
    history.pushState(null, '', `#/sdk-training#${this.currentStep}`);
  }

  public goToPreviousStep() {
    if (this.currentStep < 0) {
      return;
    }
    this.currentStep--;
    this.previousStep = this.currentStep !== 0;
    this.nextStep = this.currentStep !== 6;
    history.pushState(null, '', `#/sdk-training#${this.currentStep}`);
  }
}
