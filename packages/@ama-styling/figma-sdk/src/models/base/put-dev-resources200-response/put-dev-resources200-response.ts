/**
 * Model: PutDevResources200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DevResource } from '../dev-resource';
import { PutDevResources200ResponseErrorsInner } from '../put-dev-resources200-response-errors-inner';

export interface PutDevResources200Response {
  /** An array of links updated. */
  links_updated?: DevResource[];
  /** An array of errors. */
  errors?: PutDevResources200ResponseErrorsInner[];
}


