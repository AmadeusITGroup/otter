import {
  Validator
} from 'jsonschema';

/**
 * Get the validity of a given JSON object
 * @param jsonObject Object to check
 * @param schema Json Schema to apply to the object
 * @param errorMessage Error message display to the error
 * @param strictMode
 */
export function validateJson(jsonObject: unknown, schema: Record<string, unknown>, errorMessage = 'Invalid format, json validation failed', strictMode = false): void {
  const validator = new Validator();
  const validation = validator.validate(jsonObject, schema);
  if (!validation.valid) {
    let aggregatedError = errorMessage;
    validation.errors.forEach((error) => aggregatedError += `${JSON.stringify(error.instance)} ${JSON.stringify(error.message)}\n`);
    if (strictMode) {
      throw new Error(aggregatedError);
    }
    console.warn(aggregatedError);
  }
}
