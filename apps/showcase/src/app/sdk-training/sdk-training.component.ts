import { Component } from '@angular/core';
import {
  CopyTextPresComponent,
  SdkTrainingGenerationConfigPresComponent,
  SdkTrainingGenerationOptionsPresComponent,
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
    SdkTrainingGenerationSetupPresComponent,
    SdkTrainingGenerationStructurePresComponent,
    SdkTrainingIntroPresComponent,
    SdkTrainingWelcomePresComponent
  ],
  templateUrl: './sdk-training.component.html',
  styleUrl: './sdk-training.component.scss'
})
export class SdkTrainingComponent {
  public previousStep: boolean = false;
  public nextStep: boolean = true;
  public currentStep: number = 1;

  public goToNextStep() {
    this.currentStep++;
    if (this.currentStep === 6) {
      this.nextStep = false;
    }
    if (this.currentStep > 1) {
      this.previousStep = true;
    }
  }

  public goToPreviousStep() {
    this.currentStep--;
    if (this.currentStep === 1) {
      this.previousStep = false;
    }
    if (this.currentStep < 6) {
      this.nextStep = true;
    }
  }
}
