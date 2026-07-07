import { Component, inject, signal } from '@angular/core';
import { type Pet, PetApi } from 'sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Title of the application */
  public title = 'tutorial-app';

  private readonly petStoreApi = inject(PetApi);
  private readonly petsWritable = signal<Pet[]>([]);
  public readonly pets = this.petsWritable.asReadonly();

  constructor() {
    void this.setPets();
  }

  public async setPets() {
    // TODO Get the first 10 pets whose status is 'available'
  }
}
