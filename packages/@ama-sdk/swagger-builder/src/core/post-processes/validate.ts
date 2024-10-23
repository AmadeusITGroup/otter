import SwaggerParser from '@apidevtools/swagger-parser';
import {
  PostProcess
} from './post-process.interface';

/**
 * Post Process to validate a given Swagger spec
 */
export class Validator implements PostProcess {
  /**
   * Create a copy of the given Swagger Spec
   * @param currentNode Current node
   */
  private async copy(currentNode: any): Promise<any> {
    if (currentNode === undefined) {
      return;
    } else if (currentNode === null) {
      return null;
    } else if (Array.isArray(currentNode)) {
      return Promise.all(
        currentNode.map((n) => this.copy(n))
      );
    } else if (typeof currentNode === 'object') {
      const ret: Record<string, unknown> = {};
      for (const k of Object.keys(currentNode)) {
        const res = await this.copy(currentNode[k]);
        if (res !== undefined) {
          ret[k] = res;
        }
      }
      return ret;
    }
    return currentNode;
  }

  /** @inheritdoc */
  public async execute(swaggerSpec: any) {
    try {
      const tmp = await this.copy(swaggerSpec);
      await SwaggerParser.validate(tmp);
      return swaggerSpec;
    } catch (error: any) {
      /* eslint-disable no-console -- no logger available */
      console.error('Error while validating the swagger spec:');
      console.error(error.message);
      console.error(error.stack);
      /* eslint-enable no-console */
      // eslint-disable-next-line unicorn/no-process-exit -- false positive it will be executed in a cli
      process.exit(1);
    }
  }
}
