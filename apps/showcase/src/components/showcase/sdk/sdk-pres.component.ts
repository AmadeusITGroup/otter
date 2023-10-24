import { PetApi, Tag } from '@ama-sdk/showcase-sdk';
import type { Pet } from '@ama-sdk/showcase-sdk';
import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbHighlight, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-sdk-pres',
  standalone: true,
  imports: [CommonModule, NgbHighlight, FormsModule, NgbPagination],
  templateUrl: './sdk-pres.template.html',
  styleUrls: ['./sdk-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkPresComponent {
  private petStoreApi = inject(PetApi);

  /**
   * Name input used to create new pets
   */
  public petName = signal('');

  /**
   * Search term used to filter the list of pets
   */
  public searchTerm = signal('');

  /**
   * Number of items to display on a table page
   */
  public pageSize = signal(10);

  /**
   * Currently opened page on the table
   */
  public currentPage = signal(1);

  /**
   * Complete list of pets retrieved from the API
   */
  public pets = signal<Pet[]>([]);

  /**
   * Loading state of the API
   */
  public isLoading = signal(true);

  /**
   * Error state of the API
   */
  public hasErrors = signal(false);

  /**
   * List of pets filtered according to search term
   */
  public filteredPets = computed(() => {
    let pets = this.pets();
    if (this.searchTerm()) {
      const matchString = new RegExp(this.searchTerm().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      const matchTag = (tag: Tag) => tag.name && matchString.test(tag.name);
      pets = pets.filter((pet) =>
        (pet.id && matchString.test(String(pet.id))) ||
        matchString.test(pet.name) ||
        (pet.category?.name && matchString.test(pet.category.name)) ||
        (pet.tags && pet.tags.some(matchTag)));
    }
    return pets;
  });

  /**
   * Total amount of pet in the filtered list
   */
  public totalPetsAmount = computed(() => this.filteredPets().length);

  /**
   * List of pets displayed in the currently selected table page
   */
  public displayedPets = computed(() =>
    this.filteredPets().slice((this.currentPage() - 1) * this.pageSize(), (this.currentPage()) * this.pageSize())
  );

  constructor() {
    void this.reload();
  }

  private getNextId() {
    return this.pets().reduce<number>((maxId, pet) => Math.max(maxId, pet.id || 0), 0) + 1;
  }

  /**
   * Trigger a full reload of the list of pets by calling the API
   */
  public reload() {
    this.isLoading.set(true);
    this.hasErrors.set(false);
    return this.petStoreApi.findPetsByStatus({status: 'available'}).then((pets) => {
      this.pets.set(pets.sort((a, b) => a.id && b.id && a.id - b.id || 0));
      this.isLoading.set(false);
    }).catch(() => {
      this.isLoading.set(false);
      this.hasErrors.set(true);
    });
  }

  /**
   * Call the API to create a new pet
   */
  public async create() {
    const pet: Pet = {
      id: this.getNextId(),
      name: this.petName(),
      category: {name: 'otter'},
      tags: [{name: 'otter'}],
      status: 'available',
      photoUrls: []
    };
    this.isLoading.set(true);
    await this.petStoreApi.addPet({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Pet: pet
    });
    await this.reload();
  }

  public async delete(petToDelete: Pet) {
    if (petToDelete.id) {
      this.isLoading.set(true);
      try {
        await this.petStoreApi.deletePet({petId: petToDelete.id});
      } catch (ex) {
        // The backend respond with incorrect header application/json while the response is just a string
      }
      await this.reload();
    }
  }

  public getTags(pet: Pet) {
    return pet.tags?.map((tag) => tag.name).join(',');
  }
}
