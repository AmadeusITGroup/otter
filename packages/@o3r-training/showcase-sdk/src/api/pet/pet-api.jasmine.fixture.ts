import { PetApi } from './pet-api';

export class PetApiFixture implements Partial<Readonly<PetApi>> {

  /** @inheritDoc */
  public readonly apiName = 'PetApi';

    /**
   * Fixture associated to function addPet
   */
  public addPet: jasmine.Spy = jasmine.createSpy('addPet');
  /**
   * Fixture associated to function deletePet
   */
  public deletePet: jasmine.Spy = jasmine.createSpy('deletePet');
  /**
   * Fixture associated to function findPetsByStatus
   */
  public findPetsByStatus: jasmine.Spy = jasmine.createSpy('findPetsByStatus');
  /**
   * Fixture associated to function findPetsByTags
   */
  public findPetsByTags: jasmine.Spy = jasmine.createSpy('findPetsByTags');
  /**
   * Fixture associated to function getPetById
   */
  public getPetById: jasmine.Spy = jasmine.createSpy('getPetById');
  /**
   * Fixture associated to function updatePet
   */
  public updatePet: jasmine.Spy = jasmine.createSpy('updatePet');
  /**
   * Fixture associated to function updatePetWithForm
   */
  public updatePetWithForm: jasmine.Spy = jasmine.createSpy('updatePetWithForm');
  /**
   * Fixture associated to function uploadFile
   */
  public uploadFile: jasmine.Spy = jasmine.createSpy('uploadFile');
}
