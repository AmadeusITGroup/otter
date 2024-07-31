import {PathObject} from '@ama-sdk/core';

/* eslint-disable max-len */
export const OPERATION_ADAPTER: PathObject[] = [{
      path: "/pet",regexp: new RegExp('^/pet(?:/(?=$))?$'),operations: [{"method":"post","operationId":"addPet"},{"method":"put","operationId":"updatePet"}]
    },{
      path: "/pet/findByStatus",regexp: new RegExp('^/pet/findByStatus(?:/(?=$))?$'),operations: [{"method":"get","operationId":"findPetsByStatus"}]
    },{
      path: "/pet/findByTags",regexp: new RegExp('^/pet/findByTags(?:/(?=$))?$'),operations: [{"method":"get","operationId":"findPetsByTags"}]
    },{
      path: "/pet/{petId}",regexp: new RegExp('^/pet/((?:[^/]+?))(?:/(?=$))?$'),operations: [{"method":"get","operationId":"getPetById"},{"method":"post","operationId":"updatePetWithForm"},{"method":"delete","operationId":"deletePet"}]
    },{
      path: "/pet/{petId}/uploadImage",regexp: new RegExp('^/pet/((?:[^/]+?))/uploadImage(?:/(?=$))?$'),operations: [{"method":"post","operationId":"uploadFile"}]
    },{
      path: "/store/inventory",regexp: new RegExp('^/store/inventory(?:/(?=$))?$'),operations: [{"method":"get","operationId":"getInventory"}]
    },{
      path: "/store/order",regexp: new RegExp('^/store/order(?:/(?=$))?$'),operations: [{"method":"post","operationId":"placeOrder"}]
    },{
      path: "/store/order/{orderId}",regexp: new RegExp('^/store/order/((?:[^/]+?))(?:/(?=$))?$'),operations: [{"method":"get","operationId":"getOrderById"},{"method":"delete","operationId":"deleteOrder"}]
    },{
      path: "/user",regexp: new RegExp('^/user(?:/(?=$))?$'),operations: [{"method":"post","operationId":"createUser"}]
    },{
      path: "/user/createWithList",regexp: new RegExp('^/user/createWithList(?:/(?=$))?$'),operations: [{"method":"post","operationId":"createUsersWithListInput"}]
    },{
      path: "/user/login",regexp: new RegExp('^/user/login(?:/(?=$))?$'),operations: [{"method":"get","operationId":"loginUser"}]
    },{
      path: "/user/logout",regexp: new RegExp('^/user/logout(?:/(?=$))?$'),operations: [{"method":"get","operationId":"logoutUser"}]
    },{
      path: "/user/{username}",regexp: new RegExp('^/user/((?:[^/]+?))(?:/(?=$))?$'),operations: [{"method":"get","operationId":"getUserByName"},{"method":"put","operationId":"updateUser"},{"method":"delete","operationId":"deleteUser"}]
    }];
/* eslint-enable max-len */
