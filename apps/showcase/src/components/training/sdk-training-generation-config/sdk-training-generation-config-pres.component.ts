import { Component } from '@angular/core';
import { DfAlertModule } from '@design-factory/design-factory';
import { CopyTextPresComponent } from '../../utilities';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-generation-config-pres',
  standalone: true,
  imports: [CopyTextPresComponent, DfAlertModule, SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-generation-config-pres.component.html',
  styleUrl: './sdk-training-generation-config-pres.component.scss'
})
export class SdkTrainingGenerationConfigPresComponent {}
