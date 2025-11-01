/** Directory containing the extracted module */
export const OUTPUT_DIRECTORY = 'models_external';

/** Default manifest filenames to look for */
export const DEFAULT_MANIFEST_FILENAMES = [
  'package.json',
  'ama-openapi.manifest.json',
  'ama-openapi.manifest.yaml',
  'openapi.manifest.json',
  'openapi.manifest.yaml'
] as const;

// Internal property keys :

/** Key to mark masked properties */
export const MASKED_PROPERTY_KEY = 'x-internal-masked';
/** Key to mark touched properties */
export const TOUCHED_PROPERTY_KEY = 'x-internal-touched';
/** Key to indicate the source of the model */
export const SOURCE_PROPERTY_KEY = 'x-internal-source';
/** Key to indicate the version of the model */
export const VERSION_PROPERTY_KEY = 'x-internal-version';
/** Key to indicate reference rewrites */
export const REF_REWRITE_PROPERTY_KEY = 'x-internal-reference-rewrite';
