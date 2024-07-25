import { Component } from '@angular/core';

@Component({
  selector: 'o3r-sdk-training-step-pres',
  standalone: true,
  imports: [],
  templateUrl: './sdk-training-step-pres.component.html',
  styleUrl: './sdk-training-step-pres.component.scss'
})
export class SdkTrainingStepPresComponent {
  private widthSelection = 50;
  public leftWidthPercent = `${this,this.widthSelection}%`;
  public rightWidthPercent = `${100 - this.widthSelection}%`;
}
