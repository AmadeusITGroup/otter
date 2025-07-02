import {
  SwaggerSpec,
} from '../swagger-spec-wrappers/swagger-spec.interface';
import {
  Checker,
  CheckerError,
  Report,
} from './checker.interface';

/**
 * Checker for Multi success response
 */
export class MultiSuccessChecker implements Checker {
  /**
   * Retrieve the list success responses
   * @param swaggerSpec Swagger specification
   */
  private async getSuccessResponses(swaggerSpec: SwaggerSpec) {
    const paths = await swaggerSpec.getPaths();
    return Object.entries(paths).reduce((acc, [path, methods]: [string, { [m: string]: any }]) =>
      acc.concat(
        Object.entries(methods).map(([method, node]: [string, { [m: string]: any }]) => ({
          path,
          method,
          responses: Object.entries(node.responses as Record<string, any>).reduce((responses, [status, response]) => {
            const ref: string = response?.schema?.$ref || (response?.schema ? `custom-${status}` : 'no-content');
            if (/2\d{2}/.test(status)) {
              responses[status] = ref;
            }
            return responses;
          }, {} as Record<string, string>)
        }))
      ), [] as { path: string; method: string; responses: Record<string, string> }[]);
  }

  /**
   * Check the success responses in a swagger spec to make sure the responses are targeting the same definition
   * @param swaggerSpec Swagger specification
   */
  public async check(swaggerSpec: SwaggerSpec): Promise<Report> {
    const responsesMap = await this.getSuccessResponses(swaggerSpec);

    const multiSuccessResponses = responsesMap
      .filter(({ responses }) => {
        const responseRefs = Object.values(responses);
        return responseRefs.length > 1 && responseRefs.some((ref) => ref !== responseRefs[0]);
      })
      .map(({ path, method, responses }): CheckerError => ({
        message: `The path ${path} has success response with different return types for the method ${method}`,
        details: Object.entries(responses).map(([status, ref]) => `Response ${status} return the definition ${ref}`)
      }));

    return multiSuccessResponses;
  }
}
