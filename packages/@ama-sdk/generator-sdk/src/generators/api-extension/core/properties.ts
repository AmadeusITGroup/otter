/**
 * Properties of the generator
 */
export interface Properties {

  /** Extension name */
  name: string;

  /** Type of the DxAPI specification to extend */
  coreType: 'private' | 'public';

  /** Version of the swagger specification to extend */
  coreVersion: string;

  /** Version of the current generator */
  myVersion: string;
}
