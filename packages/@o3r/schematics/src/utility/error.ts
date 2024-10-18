import {
  getEnvironmentInfoStringify
} from './environment';

/**
 * Error to be throw when otter script failed
 */
export class O3rCliError extends Error {
  constructor(error: any) {
    super(
      error.toString() as string
      + '\n\nYou can file new issues by selecting from our issue templates (https://github.com/AmadeusITGroup/otter/issues/new/choose) and filling out the issue template.'
      + '\n\nTo facilitate the reproduction of the issue, do not forget to provide us your environment information:\n'
      + getEnvironmentInfoStringify()
    );
  }
}
