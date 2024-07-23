import { Component } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-generation-structure-pres',
  standalone: true,
  imports: [NgbAccordionModule, SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-generation-structure-pres.component.html',
  styleUrl: './sdk-training-generation-structure-pres.component.scss'
})
export class SdkTrainingGenerationStructurePresComponent {}
