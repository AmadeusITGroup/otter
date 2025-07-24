import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DummyApi, Flight } from 'sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Title of the application */
  public title = 'tutorial-app';

  public readonly dummyApi = inject(DummyApi);

  public readonly flight = signal<Flight | undefined>(undefined);

  public readonly error = signal('');

  constructor() {
    void this.loadDummyData();
  }

  async loadDummyData() {
    this.error.set('');
    try {
      const dummyData = await this.dummyApi.dummyGet({});
      this.flight.set(dummyData);
    } catch (err: any) {
      this.error.set(err);
    }
  }
}
