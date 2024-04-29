import { computed, inject, Injectable, type OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DfMedia } from '@design-factory/design-factory';
import { PetApi} from '@ama-sdk/showcase-sdk';
import type { Pet, Tag } from '@ama-sdk/showcase-sdk';
import { Store } from '@ngrx/store';

const FILTER_PAG_REGEX = /[^0-9]/g;

import { BackEndService } from './backend.service';
import { setPetstoreEntitiesFromApi/* , setPetstoreEntityFromApi*/, upsertPetstoreEntitiesFromApi } from './store/petstore/petstore.actions';
import { selectAllPetstore, selectPetstoreStoreFailingStatus, selectPetstoreStorePendingStatus } from './store/petstore/petstore.selectors';

@Injectable()
export class TanstackService implements OnInit {
  private readonly petStoreApi = inject(PetApi);
  private readonly mediaService = inject(DfMedia);
  public readonly backend = inject(BackEndService);
  public readonly store = inject(Store);

  /**
   * Name input used to create new pets
   */
  public petName = signal('');

  /**
   * File input used to create new pets
   */
  public petImage = signal('');

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

  public isLoading = this.store.select(selectPetstoreStorePendingStatus);

  public isFailing = this.store.select(selectPetstoreStoreFailingStatus);

  public pets = signal<Pet[]>([]);

  /**
   * List of pets filtered according to search term
   */
  public filteredPets = computed(() => {
    let pets = this.pets();
    if (this.searchTerm()) {
      const matchString = new RegExp(this.searchTerm().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      const matchTag = (tag: Tag) => tag.name && matchString.test(tag.name);
      pets = pets.filter((pet: Pet) =>
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

  /**
   * True if screen size is 'xs' or 'sm'
   */
  public isSmallScreen = toSignal<boolean>(this.mediaService.getObservable(['xs', 'sm']));

  /** Base URL where the images can be fetched */
  public baseUrl = location.href.split('/#', 1)[0];

  constructor() {
    this.store.select(selectAllPetstore).subscribe((pets) => this.pets.set(pets));
  }


  private getNextId() {
    return this.pets().reduce((maxId: number, pet: Pet) => pet.id && pet.id < Number.MAX_SAFE_INTEGER ? Math.max(maxId, pet.id) : maxId, 0) + 1;
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle, @typescript-eslint/explicit-member-accessibility
  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  // How to abort the queries ?
  public loadPets = async (/* abortSignal: AbortSignal*/) => {
    const call = this.petStoreApi.findPetsByStatus({status: 'available'}/* , {signal: abortSignal}*/).then((pets: Pet[]) =>
      pets.filter((p: Pet) => p.category?.name === 'otter').sort((a: Pet, b: Pet) => a.id && b.id && a.id - b.id || 0));
    this.store.dispatch(setPetstoreEntitiesFromApi({call}));
    try {
      await call;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('error', e);
    }
  };

  /**
   * Trigger a full reload of the list of pets by calling the API
   */
  public async reload() {
    await this.loadPets();
  }


  /**
   * Call the API to create a new pet
   */
  public create() {
    const pet: Pet = {
      id: this.getNextId(),
      name: this.petName(),
      category: {name: 'otter'},
      tags: [{name: 'otter'}],
      status: 'available',
      photoUrls: this.petName() ? [this.petImage()] : []
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // this.store.dispatch(setPetstoreEntityFromApi({call: this.petStoreApi.addPet({Pet: pet})}));

    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.store.dispatch(upsertPetstoreEntitiesFromApi({call: this.petStoreApi.addPet({Pet: pet}).then(p => new Array<Pet>(p))}));
  }

  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async delete(petToDelete: Pet) {
    if (petToDelete.id) {
      const call = this.petStoreApi.deletePet({petId: petToDelete.id});
      // this.store.dispatch()  // here we need to create a new action to delete the elements
      // an optimistic update would be to remove the element directly in the store
      try {
        await call;
      } catch (error) {
        // process with the error of deleting
      }
      await this.reload(); // because one element has been deleted
    }
  }

  public getTags(pet: Pet) {
    return pet.tags?.map((tag: Tag) => tag.name).join(',');
  }

  public formatPaginationInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }
}
