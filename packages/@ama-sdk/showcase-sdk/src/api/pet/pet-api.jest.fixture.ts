import { ApiResponse } from '../../models/base/api-response/index';
import { Pet } from '../../models/base/pet/index';

import { PetApi, PetApiAddPetRequestData, PetApiDeletePetRequestData, PetApiFindPetsByStatusRequestData, PetApiFindPetsByTagsRequestData, PetApiGetPetByIdRequestData, PetApiUpdatePetRequestData, PetApiUpdatePetWithFormRequestData, PetApiUploadFileRequestData } from './pet-api';

export class PetApiFixture implements Partial<Readonly<PetApi>> {

  /** @inheritDoc */
  public readonly apiName = 'PetApi';

    /**
   * Fixture associated to function addPet
   */
  public addPet: jest.Mock<Promise<Pet>, [PetApiAddPetRequestData]> = jest.fn();
  /**
   * Fixture associated to function deletePet
   */
  public deletePet: jest.Mock<Promise<string>, [PetApiDeletePetRequestData]> = jest.fn();
  /**
   * Fixture associated to function findPetsByStatus
   */
  public findPetsByStatus: jest.Mock<Promise<Pet[]>, [PetApiFindPetsByStatusRequestData]> = jest.fn();
  /**
   * Fixture associated to function findPetsByTags
   */
  public findPetsByTags: jest.Mock<Promise<Pet[]>, [PetApiFindPetsByTagsRequestData]> = jest.fn();
  /**
   * Fixture associated to function getPetById
   */
  public getPetById: jest.Mock<Promise<Pet>, [PetApiGetPetByIdRequestData]> = jest.fn();
  /**
   * Fixture associated to function updatePet
   */
  public updatePet: jest.Mock<Promise<Pet>, [PetApiUpdatePetRequestData]> = jest.fn();
  /**
   * Fixture associated to function updatePetWithForm
   */
  public updatePetWithForm: jest.Mock<Promise<never>, [PetApiUpdatePetWithFormRequestData]> = jest.fn();
  /**
   * Fixture associated to function uploadFile
   */
  public uploadFile: jest.Mock<Promise<ApiResponse>, [PetApiUploadFileRequestData]> = jest.fn();
}

