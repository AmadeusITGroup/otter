import type {
  Output,
} from '@o3r/core';
import {
  JSONDefinition,
} from './json-definition';

export interface JSONSchema extends Output {
  type: string;
  definitions?: { [name: string]: JSONDefinition };
}
