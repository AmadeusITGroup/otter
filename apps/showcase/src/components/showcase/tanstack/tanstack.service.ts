import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DfMedia } from '@design-factory/design-factory';
import { PetApi} from '@ama-sdk/showcase-sdk';
import type { Pet, Tag } from '@ama-sdk/showcase-sdk';

const FILTER_PAG_REGEX = /[^0-9]/g;
const TANSTACK_QUERY_OFFLINE_CACHE = `TANSTACK_QUERY_OFFLINE_CACHE`;

// Tanstack
import {injectMutation, injectQuery, injectQueryClient, type QueryClient } from '@tanstack/angular-query-experimental';
import { BackEndService } from './backend.service';
// eslint-disable-next-line camelcase
import { experimental_createPersister } from '@tanstack/query-persist-client-core';

@Injectable()
export class TanstackService {
  private readonly petStoreApi = inject(PetApi);
  private readonly mediaService = inject(DfMedia);
  public readonly backend = inject(BackEndService);

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


  public queryClient = injectQueryClient();

  /**
   * Complete list of pets retrieved from the API
   */
  public pets = injectQuery<Pet[]>(() => ({
    queryKey: ['findPetsByStatus', {status: 'available'}],
    // eslint-disable-next-line @typescript-eslint/no-shadow
    queryFn: ({signal}) =>
      this.petStoreApi.findPetsByStatus({status: 'available'}, {signal}).then((pets: Pet[]) =>
        pets.filter((p: Pet) => p.category?.name === 'otter').sort((a: Pet, b: Pet) => a.id && b.id && a.id - b.id || 0)),
    initialData: [], // ,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    persister: experimental_createPersister({
      storage: localStorage
    }),
    onSuccess: () => {
      const data = this.queryClient.getQueryState(['findPetsByStatus', {status: 'available'}])?.data ?? '';
      // const dataUpdateAt = this.queryClient.getQueryState(['findPetsByStatus', {status: 'available'}])?.dataUpdatedAt;
      localStorage.setItem(`${TANSTACK_QUERY_OFFLINE_CACHE} findPetsByStatus ${JSON.stringify({status: 'available'})}`, JSON.stringify(data));
    }
  }));


  public mutationUploadFile = injectMutation((client: QueryClient) => ({
    mutationFn: (petFile: {petId: number; body: any}) => this.petStoreApi.uploadFile(petFile),
    onSuccess: async () => {
      // Invalidate and refetch by using the client directly
      await client.invalidateQueries({ queryKey: ['findPetsByStatus'] });
    }
  }));


  public mutationAdd = injectMutation((client: QueryClient) => ({
    mutationFn: (pet: Pet) => this.petStoreApi.addPet({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Pet: pet
    }),
    onSuccess: async (_data: any, pet: Pet, _context: any) => {
      if (pet.photoUrls.length) {
        const filePath = `${this.baseUrl}${pet.photoUrls[0]}`;
        const blob = await (await fetch(filePath)).blob();
        this.mutationUploadFile.mutate({petId: pet.id, body: new File([blob], filePath, {type: blob.type})});
      } else {
        await client.invalidateQueries({ queryKey: ['findPetsByStatus'] });
      }
    }
  }));

  public mutationDelete = injectMutation((client: QueryClient) => ({
    mutationFn: async (petId: number) => {
      try {
        await this.petStoreApi.deletePet({petId});
      } catch (ex) {
        // The backend respond with incorrect header application/json while the response is just a string
        // console.log('ex', ex);
        // We need to parse the string and return true only when the error is not an error.
      }
      return true;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['findPetsByStatus'] });
    }
  }));

  /**
   * List of pets filtered according to search term
   */
  public filteredPets = computed(() => {
    let pets = this.pets.data();
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

  private getNextId() {
    return this.pets.data().reduce((maxId: number, pet: Pet) => pet.id && pet.id < Number.MAX_SAFE_INTEGER ? Math.max(maxId, pet.id) : maxId, 0) + 1;
  }

  /**
   * Trigger a full reload of the list of pets by calling the API
   */
  public async reload() {
    await this.queryClient.invalidateQueries({ queryKey: ['findPetsByStatus'] });
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
    this.mutationAdd.mutate(pet);
  }

  public delete(petToDelete: Pet) {
    if (petToDelete.id) {
      this.mutationDelete.mutate(petToDelete.id);
    }
  }

  public getTags(pet: Pet) {
    return pet.tags?.map((tag: Tag) => tag.name).join(',');
  }

  public formatPaginationInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }
}
