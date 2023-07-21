/* eslint-disable no-use-before-define */
export interface SchematicOptionObject {
  [optionName: string]: SchematicOptionValue;
}

export type SchematicOptionValue =
  | boolean
  | number
  | string
  | undefined
  | SchematicOptionValue[]
  | SchematicOptionObject;
