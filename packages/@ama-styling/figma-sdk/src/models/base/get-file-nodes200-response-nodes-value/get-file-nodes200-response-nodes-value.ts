/**
 * Model: GetFileNodes200ResponseNodesValue
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { Component } from '../component';
import { ComponentSet } from '../component-set';
import { Node } from '../node';
import { Style } from '../style';

export interface GetFileNodes200ResponseNodesValue {
  /** @see Node */
  document: Node;
  /** A mapping from component IDs to component metadata. */
  components: { [key: string]: Component; };
  /** A mapping from component set IDs to component set metadata. */
  componentSets: { [key: string]: ComponentSet; };
  /** The version of the file schema that this file uses. */
  schemaVersion: number;
  /** A mapping from style IDs to style metadata. */
  styles: { [key: string]: Style; };
}


