import { createStore, select, setProp, withProps } from '@ngneat/elf';
import {
  localStorageStrategy,
  persistState
} from '@ngneat/elf-persist-state';
import { selectAllEntities, setEntities, withEntities } from '@ngneat/elf-entities';
import {inject, Injectable} from '@angular/core';
import type { Pet } from '@ama-sdk/showcase-sdk';
import {PetApi} from '@ama-sdk/showcase-sdk';
import {
  createRequestDataSource,
  withRequestsStatus
} from '@ngneat/elf-requests';
import { StoreNames } from './store-names.enum';
import { from, map, skipUntil, tap } from 'rxjs';

const store = createStore({name: StoreNames.PET}, withEntities<Pet>(), withRequestsStatus(), withProps<{ lastFetch: number}>({lastFetch: 0}));

const persist = persistState(store, {
  key: StoreNames.PET,
  storage: localStorageStrategy
});

const { setSuccess, trackRequestStatus, data$ } =
  createRequestDataSource({
    data$: () => store.pipe(selectAllEntities()),
    requestKey: StoreNames.PET,
    dataKey: StoreNames.PET,
    store
  });

const setPets = (pets: Pet[]) => {
  store.update(setEntities(pets), setSuccess(), setProp('lastFetch', Date.now()));
};

const petsDataSource = data$();

@Injectable({providedIn: 'root'})
export class PetFacade {

  private readonly petStoreApi = inject(PetApi);

  private readonly baseUrl = location.href.split('/#', 1)[0];

  public readonly pets = petsDataSource.pipe(select(data => data.pets));
  public readonly loading = petsDataSource.pipe(select(data => data.loading));
  public readonly error = petsDataSource.pipe(select(data => data.error));
  public readonly lastFetch = store.pipe(skipUntil(persist.initialized$), select(petStore => petStore.lastFetch));

  private async createAndUploadPet(pet: Pet) {
    await this.petStoreApi.addPet({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Pet: pet
    });
    if (pet.photoUrls.length) {
      const filePath = `${this.baseUrl}${pet.photoUrls[0]}`;
      const blob = await fetch(filePath).then(res => res.blob());
      await this.petStoreApi.uploadFile({
        petId: pet.id,
        body: new File([blob], filePath, {type: blob.type})
      });
    }
  }

  // fetch available otter pets and sorts them
  public fetchPets() {
    from(this.petStoreApi.findPetsByStatus({status: 'available'})).pipe(
      trackRequestStatus(),
      map(pets => pets.filter((p) => p.category?.name === 'otter').sort((a, b) => a.id && b.id && a.id - b.id || 0)),
      tap(setPets)
    ).subscribe();
  }

  // creates a new pet and refreshes the list of pets
  public createPet(pet: Pet) {
    from(this.createAndUploadPet(pet)).pipe(trackRequestStatus(), tap(() => this.fetchPets())).subscribe();
  }

  // deletes a pet
  public deletePet(petId: number) {
    from(this.petStoreApi.deletePet({petId})).pipe(trackRequestStatus(), tap(() => this.fetchPets())).subscribe();
  }
}
