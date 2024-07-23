import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { CopyTextPresComponent } from '../../utilities';
import { SdkTrainingStepPresComponent } from '../sdk-training-step';

@Component({
  selector: 'o3r-sdk-training-generation-options-pres',
  standalone: true,
  imports: [CopyTextPresComponent, FormsModule, NgbAccordionModule, SdkTrainingStepPresComponent],
  templateUrl: './sdk-training-generation-options-pres.component.html',
  styleUrl: './sdk-training-generation-options-pres.component.scss'
})
export class SdkTrainingGenerationOptionsPresComponent {
  public viewDatesExample = false;
  public viewExtensibleModelsExample = false;

  public viewExampleText = 'View Example';
  public hideExampleText = 'Hide Example';

  public stringifyDateToggle = true;
  public allowModelExtensionToggle = true;

  public updateViewDatesExample() {
    this.viewDatesExample = !this.viewDatesExample;
  }
  public updateViewExtensibleModelsExample() {
    this.viewExtensibleModelsExample = !this.viewExtensibleModelsExample;
  }
}
