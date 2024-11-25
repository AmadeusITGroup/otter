import { Component, inject, signal } from '@angular/core';
import { type Pet, PetApi } from 'sdk';

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

  private readonly petStoreApi = inject(PetApi);
  readonly #pets = signal<Pet[]>([]);
  public readonly pets = this.#pets.asReadonly();

  constructor() {
    void this.setPets();
  }

  public async setPets() {
    /* Get the first 10 pets whose status is 'available' */
    const pets = await this.petStoreApi.findPetsByStatus({status: 'available'});
    this.#pets.set(pets.slice(0, 10));
  }
}
