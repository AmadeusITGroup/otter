import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiFactoryService } from '@o3r/apis-manager';
import { type Pet, PetApi, StoreApi } from 'sdk';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Title of the application */
  public title = 'tutorial-app';

  // TODO Inject the ApiFactoryService and get the corresponding APIs
  private readonly petApi = inject(PetApi);
  private readonly storeApi = inject(StoreApi);

  private readonly petsWritable = signal<Pet[]>([]);
  public readonly pets = this.petsWritable.asReadonly();

  private readonly petsInventoryWritable = signal<{ [key: string]: number }>({});
  public readonly petsInventory = this.petsInventoryWritable.asReadonly();

  /** Get the pets whose status is 'available' */
  public async getAvailablePets() {
    const availablePets = await this.petApi.findPetsByStatus({status: 'available'});
    this.petsWritable.set(availablePets);
  }

  /** Get the pets inventory */
  public async getPetInventory() {
    const inventory = await this.storeApi.getInventory({});
    this.petsInventoryWritable.set(inventory);
  }
}
