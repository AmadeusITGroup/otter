import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TrainingComponent} from '../../components';

@Component({
  selector: 'o3r-sdk-training',
  standalone: true,
  imports: [
    TrainingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sdk-training.template.html',
  styleUrls: ['./sdk-training.style.scss']
})
export class SdkTrainingComponent {}
