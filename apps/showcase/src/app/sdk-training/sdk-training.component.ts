import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  TrainingComponent
} from '../../components';

@Component({
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    TrainingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<o3r-training [title]="\'SDK Training\'" [trainingPath]="\'sdk-training\'"></o3r-training>',
  styleUrls: ['./sdk-training.component.scss']
})
export class SdkTrainingComponent {}
