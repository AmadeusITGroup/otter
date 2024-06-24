import { Tag } from '@ama-sdk/showcase-sdk';
import type { Pet } from '@ama-sdk/showcase-sdk';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DfMedia } from '@design-factory/design-factory';
import { NgbHighlight, NgbPagination, NgbPaginationPages } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';
import { OtterPickerPresComponent } from '../../utilities';
import { PetFacade } from '../../../stores';
import { take } from 'rxjs';

const FILTER_PAG_REGEX = /[^0-9]/g;

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-elf-pres',
  standalone: true,
  imports: [
    NgbHighlight,
    FormsModule,
    NgbPagination,
    OtterPickerPresComponent,
    NgbPaginationPages
  ],
  templateUrl: './elf-pres.template.html',
  styleUrls: ['./elf-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElfPresComponent implements OnInit {
  private readonly mediaService = inject(DfMedia);
  private readonly petFacade = inject(PetFacade);

  /**
   * Name input used to create new pets
   */
  public readonly petName = signal('');

  /**
   * File input used to create new pets
   */
  public readonly petImage = signal('');

  /**
   * Search term used to filter the list of pets
   */
  public readonly searchTerm = signal('');

  /**
   * Number of items to display on a table page
   */
  public readonly pageSize = signal(10);

  /**
   * Currently opened page on the table
   */
  public readonly currentPage = signal(1);

  /**
   * Complete list of pets retrieved from the API
   */
  public readonly pets = toSignal(this.petFacade.pets, {initialValue: []});

  /**
   * Loading state of the API
   */
  public readonly isLoading = toSignal(this.petFacade.loading, {initialValue: false});

  /**
   * Error state of the API
   */
  public readonly hasErrors = toSignal(this.petFacade.error, {initialValue: false});

  /**
   * List of pets filtered according to search term
   */
  public readonly filteredPets = computed(() => {
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
  public readonly totalPetsAmount = computed(() => this.filteredPets().length);

  /**
   * List of pets displayed in the currently selected table page
   */
  public readonly displayedPets = computed(() =>
    this.filteredPets().slice((this.currentPage() - 1) * this.pageSize(), (this.currentPage()) * this.pageSize())
  );

  /**
   * True if screen size is 'xs' or 'sm'
   */
  public readonly isSmallScreen = toSignal<boolean>(this.mediaService.getObservable(['xs', 'sm']));

  /** Base URL where the images can be fetched */
  public baseUrl = location.href.split('/#', 1)[0];

  private getNextId() {
    return this.pets().reduce<number>((maxId, pet) => pet.id && pet.id < Number.MAX_SAFE_INTEGER ? Math.max(maxId, pet.id) : maxId, 0) + 1;
  }

  /**
   * Trigger a full reload of the list of pets by calling the API
   */
  public reload() {
    this.petFacade.fetchPets();
  }

  public ngOnInit() {
    this.petFacade.lastFetch.pipe(take(1)).subscribe((lastFetch) => {
      if (Date.now() - lastFetch > 300_000) {
        this.reload();
      }
    });
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
    this.petFacade.createPet(pet);
  }

  public delete(petToDelete: Pet) {
    if (petToDelete.id) {
      this.petFacade.deletePet(petToDelete.id);
    }
  }

  public getTags(pet: Pet) {
    return pet.tags?.map((tag) => tag.name).join(',');
  }

  public formatPaginationInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }
}
