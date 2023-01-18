/** Accepted Hostings */
export const enum Hostings {
  AZURE = 'Azure DevOps',
  OTHER = 'Other'
}

/**
 * Proterty of the generator
 */
export interface Properties {
  [key: string]: string | undefined;

  /** Project name (NPM package scope) */
  projectName?: string;

  /** Package name */
  projectPackageName?: string;

  /** Project description */
  projectDescription?: string;

  /** Platform on which the project's code will be hosted. */
  projectHosting?: Hostings;

  /** Version of the SDK-Core to base on */
  sdkCoreVersion?: string;
}


