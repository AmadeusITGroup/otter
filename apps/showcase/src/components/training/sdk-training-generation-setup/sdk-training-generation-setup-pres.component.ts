import { Component } from '@angular/core';
import { CopyTextPresComponent } from '../../utilities';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-generation-setup-pres',
  standalone: true,
  imports: [CopyTextPresComponent, SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-generation-setup-pres.component.html',
  styleUrl: './sdk-training-generation-setup-pres.component.scss'
})
export class SdkTrainingGenerationSetupPresComponent {}
