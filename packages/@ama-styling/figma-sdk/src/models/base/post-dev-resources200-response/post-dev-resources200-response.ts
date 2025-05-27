/**
 * Model: PostDevResources200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DevResource } from '../dev-resource';
import { PostDevResources200ResponseErrorsInner } from '../post-dev-resources200-response-errors-inner';

export interface PostDevResources200Response {
  /** An array of links created. */
  links_created: DevResource[];
  /** An array of errors. */
  errors?: PostDevResources200ResponseErrorsInner[];
}


