import { Pet } from '../../models/base/pet/index';

import { AddPetRequestData, DeletePetRequestData, FindPetsByStatusRequestData, FindPetsByTagsRequestData, GetPetByIdRequestData, PetApi, UpdatePetRequestData, UpdatePetWithFormRequestData } from './pet-api';

export class PetApiFixture implements Partial<Readonly<PetApi>> {

  /** @inheritDoc */
  public readonly apiName = 'PetApi';

  /**
   * Fixture associated to function addPet
   */
  public addPet: jest.Mock<Promise<Pet>, [AddPetRequestData]> = jest.fn();
  /**
   * Fixture associated to function deletePet
   */
  public deletePet: jest.Mock<Promise<string>, [DeletePetRequestData]> = jest.fn();
  /**
   * Fixture associated to function findPetsByStatus
   */
  public findPetsByStatus: jest.Mock<Promise<Pet[]>, [FindPetsByStatusRequestData]> = jest.fn();
  /**
   * Fixture associated to function findPetsByTags
   */
  public findPetsByTags: jest.Mock<Promise<Pet[]>, [FindPetsByTagsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getPetById
   */
  public getPetById: jest.Mock<Promise<Pet>, [GetPetByIdRequestData]> = jest.fn();
  /**
   * Fixture associated to function updatePet
   */
  public updatePet: jest.Mock<Promise<Pet>, [UpdatePetRequestData]> = jest.fn();
  /**
   * Fixture associated to function updatePetWithForm
   */
  public updatePetWithForm: jest.Mock<Promise<never>, [UpdatePetWithFormRequestData]> = jest.fn();
}

