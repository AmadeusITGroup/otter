import { utils } from '@ama-sdk/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Title of the application */
  public title = 'tutorial-app';

  /** Date value used to initialize the variables date and dateTime */
  public dateValue = '';
  /** Date variable of type Date */
  public date: Date | null = null;
  /** Date variable of type utils.DateTime */
  public dateTime: utils.DateTime | null = null;

  constructor() {
    this.updateValues();
  }

  public updateValues() {
    // TODO Set the values of the variables date and dateTime here
  }
}
