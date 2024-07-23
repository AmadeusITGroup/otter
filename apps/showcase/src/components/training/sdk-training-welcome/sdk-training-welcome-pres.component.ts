import { Component } from '@angular/core';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-welcome-pres',
  standalone: true,
  imports: [SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-welcome-pres.component.html',
  styleUrl: './sdk-training-welcome-pres.component.scss'
})
export class SdkTrainingWelcomePresComponent {}
