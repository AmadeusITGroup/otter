/** Directory containing the extracted module */
export const OUTPUT_DIRECTORY = 'models_external';

/** Directory containing masked model when the mask is applied to referenced models */
export const SUB_MASK_DIRECTORY = 'sub-masks';

/** Default manifest filenames to look for */
export const DEFAULT_MANIFEST_FILENAMES = [
  'ama-openapi.manifest.json',
  'ama-openapi.manifest.yaml',
  'ama-openapi.manifest.yml',
  'openapi.manifest.json',
  'openapi.manifest.yaml',
  'openapi.manifest.yml',
  'package.json'
] as const;

/** Default directory where to generate the JSON Schemas */
export const DEFAULT_SCHEMA_OUTPUT_DIRECTORY = 'schemas';

/** NPM keywords to identify a specification package */
export const OPENAPI_NPM_KEYWORDS = ['openapi'] as const;

/** Name of the JSON schema validating the manifest file */
export const MANIFEST_SCHEMA_FILE = 'manifest.schema.json';

// Internal property keys :

/** Key to mark masked properties */
export const MASKED_PROPERTY_KEY = 'x-internal-masked';
/** Key to mark touched properties */
export const TOUCHED_PROPERTY_KEY = 'x-internal-touched';
/** Key to indicate the source of the model (e.g: `<package>/<model-path>`) */
export const SOURCE_PROPERTY_KEY = 'x-internal-source';
/** Key to indicate the version of the model */
export const VERSION_PROPERTY_KEY = 'x-internal-version';
/** Key to indicate the reference is rewritten */
export const REF_REWRITTEN_PROPERTY_KEY = 'x-internal-reference-rewritten';
/** Key to indicate generated $ref references */
export const GENERATED_REF_PROPERTY_KEY = 'x-internal-reference-generated';
