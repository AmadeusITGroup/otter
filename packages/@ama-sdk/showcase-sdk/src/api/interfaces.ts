/* @deprecated : this file is deprecated, the RequestData interfaces are exported at package level */

export type { AddPetRequestData, DeletePetRequestData, FindPetsByStatusRequestData, FindPetsByTagsRequestData, GetPetByIdRequestData, UpdatePetRequestData, UpdatePetWithFormRequestData, UploadFileRequestData } from './pet/index';
export type { AddPet, DeletePet, FindPetsByStatus, FindPetsByTags, GetPetById, UpdatePet, UpdatePetWithForm, UploadFile } from './pet/index';
export type { DeleteOrderRequestData, GetInventoryRequestData, GetOrderByIdRequestData, PlaceOrderRequestData } from './store/index';
export type { DeleteOrder, GetInventory, GetOrderById, PlaceOrder } from './store/index';
export type { CreateUserRequestData, CreateUsersWithListInputRequestData, DeleteUserRequestData, GetUserByNameRequestData, LoginUserRequestData, LogoutUserRequestData, UpdateUserRequestData } from './user/index';
export type { CreateUser, CreateUsersWithListInput, DeleteUser, GetUserByName, LoginUser, LogoutUser, UpdateUser } from './user/index';
