import {
  PostProcess,
} from './post-process.interface';

/**
 * Post Process to Convert the spec to a AWS compatible spec
 */
export class AwsCompatConverter implements PostProcess {
  /**
   * Determine if the field need to be kept
   * @param field Field name
   * @param ancestors
   */
  private isInvalidField(field: string | undefined, ancestors: string[]) {
    return field && (
      field.toLowerCase() === 'example'
      || (field === 'default' && ancestors[0] === 'paths' && ancestors.at(-1) === 'responses')
      || field === 'discriminator'
      || /^x-.*/i.test(field)
    );
  }

  /**
   * Remove the invalid field from a given Swagger Spec
   * @param currentNode Node to inspect in the Swagger spec object
   * @param ancestors
   * @param field Field of the node
   */
  private async removeInvalidFields(currentNode: any, ancestors: string[] = [], field?: string): Promise<any> {
    if (currentNode === undefined) {
      return;
    } else if (currentNode === null) {
      return null;
    } else if (this.isInvalidField(field, ancestors)) {
      return undefined;
    } else if (Array.isArray(currentNode)) {
      return Promise.all(
        currentNode.map((n) => this.removeInvalidFields(n, ancestors))
      );
    } else if (typeof currentNode === 'object') {
      if (field) {
        ancestors = [...ancestors, field];
      }
      const ret: Record<string, unknown> = {};
      for (const k of Object.keys(currentNode)) {
        const res = await this.removeInvalidFields(currentNode[k], ancestors, k);
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
    return this.removeInvalidFields(swaggerSpec);
  }
}
