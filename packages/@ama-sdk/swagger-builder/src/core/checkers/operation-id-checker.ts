import { SwaggerSpec } from '../swagger-spec-wrappers/swagger-spec.interface';
import { Checker, CheckerError, Report } from './checker.interface';

/**
 * Checker for operation IDs
 */
export class OperationIdChecker implements Checker {

  /**
   * Retrieve the list of operation IDs from a swagger spec
   * @param swaggerSpec Swagger specification
   */
  private async getOperationIds(swaggerSpec: SwaggerSpec) {
    const paths = await swaggerSpec.getPaths();
    return Object.entries(paths).reduce((acc, [path, methods]: [string, { [m: string]: any }]) =>
      acc.concat(
        Object.entries(methods).map(([method, node]: [string, { [m: string]: any }]) => ({ path, method, id: node.operationId}))
      ), [] as { path: string; method: string; id: string }[]);
  }

  /**
   * Check the uniqueness of the Operation IDs in a swagger spec
   * @param swaggerSpec Swagger specification
   */
  public async check(swaggerSpec: SwaggerSpec): Promise<Report> {

    const operationIds = await this.getOperationIds(swaggerSpec);

    const noOperationIdReport = operationIds
      .filter(({id}) => !id)
      .map(({ path, method }): CheckerError => ({
        message: `The path ${path} does not have OperationId for the method ${method}`
      }));

    const duplicateOperationIdReport = Object.entries(
      operationIds
        .filter(({ id }) => !!id)
        .reduce((acc, operationIdObj) => {
          if (!acc[operationIdObj.id]) {
            acc[operationIdObj.id] = [];
          }
          acc[operationIdObj.id].push(operationIdObj);
          return acc;
        }, {} as { [x: string]: { path: string; method: string }[] })
    )
      .filter(([_id, duplicates]) => duplicates.length > 1)
      .map(([id, duplicates]): CheckerError => ({
        message: `OperationId ${id} is duplicated on several paths`,
        details: duplicates.map(({ path, method }) => `${path} (${method})`)
      }));

    return noOperationIdReport.concat(duplicateOperationIdReport);
  }

}
