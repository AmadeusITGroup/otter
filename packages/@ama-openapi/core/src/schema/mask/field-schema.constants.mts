/** Name of the schema for a mask applied to a specification field */
export const FIELD_SCHEMA_NAME = 'baseMaskField';

/** Inner path of the schema for a mask applied to a specification field */
export const FIELD_SCHEMA_REF = `#/definitions/${FIELD_SCHEMA_NAME}`;

/** Basic mask which can be applied to a specification field */
export const FIELD_SCHEMA_DEFINITION = {
  [FIELD_SCHEMA_NAME]: {
    oneOf: [
      { type: 'boolean' },
      { const: {} },
      { const: null }
    ]
  }
};
