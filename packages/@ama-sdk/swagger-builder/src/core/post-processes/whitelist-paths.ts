import {
  PostProcess,
} from './post-process.interface';

/**
 * Post Process to remove non white listed paths from the final Swagger Specification
 */
export class PathsWhitelister implements PostProcess {
  constructor(private readonly pathPatterns: (string | RegExp)[] = []) {}

  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    const spec = { ...swaggerSpec };
    spec.paths = Object.keys(spec.paths)
      .filter((p) => this.pathPatterns
        .some((pattern) => {
          return typeof pattern === 'string' ? p === pattern : pattern.test(p);
        })
      )
      .reduce<any>((acc, p) => {
        acc[p] = spec.paths[p];
        return acc;
      }, {});

    return spec;
  }
}
