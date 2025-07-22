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
