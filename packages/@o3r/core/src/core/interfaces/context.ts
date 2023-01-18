/* eslint-disable @typescript-eslint/ban-types */

import type { EventEmitter } from '@angular/core';
import type { FormControl } from '@angular/forms';
import type { Translation } from './translation';

/**
 * Inputs of the component
 */
export interface ContextInput {
  [key: string]: any;
}

/**
 * Base outputs of the components
 */
export interface BaseContextOutput {
  [key: string]: any;
}


/**
 * Type helper to generate the interface of component outputs
 */
export type EventEmitterify<T extends BaseContextOutput> = { [P in keyof T]: EventEmitter<T[P]> };

/**
 * Context of the component
 */
export type Context<T extends ContextInput = {}, U extends BaseContextOutput = {}> = {[P in keyof T]: T[P]} & {[P in keyof U]: EventEmitterify<U>[P]};

/**
 * Type helper to generate the template context outputs
 */
export type Functionify<T extends BaseContextOutput> = { [P in keyof T]: (value: T[P]) => void };


/**
 * Interface for a context of a child component
 */
export interface TemplateContext<
  N extends {},
  S extends ContextInput = Record<string, unknown>,
  F extends BaseContextOutput = Record<string, unknown>,
  W extends Translation = Translation> {
  /** Component configuration */
  config?: Partial<N>;
  /** Component inputs context */
  inputs: S & {[key: string]: any};
  /** Component outputs context */
  outputs: Functionify<F & {[key: string]: any}>;
  /** Component translation */
  translations?: Partial<W>;
  /** Parent Component Id */
  parentId?: string;
  /** Form control object to be applied to the form */
  formControl?: FormControl;
}
