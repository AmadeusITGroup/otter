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
  templateUrl: './sdk-training.html',
  styleUrls: ['./sdk-training.scss']
})
export class SdkTraining {}
