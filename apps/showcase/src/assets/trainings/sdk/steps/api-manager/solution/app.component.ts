import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiFactoryService } from '@o3r/apis-manager';
import { type Pet, PetApi, StoreApi } from 'sdk';

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

  private readonly petApi = inject(ApiFactoryService).getApi(PetApi);
  private readonly storeApi = inject(ApiFactoryService).getApi(StoreApi);

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
