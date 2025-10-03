import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  Training,
} from '../../components';

@Component({
  selector: 'o3r-sdk-training',
  imports: [
    Training
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sdk-training.template.html',
  styleUrls: ['./sdk-training.style.scss']
})
export class SdkTraining {}
