import { PostProcess } from './post-process.interface';

/**
 * Post Process to remove non white listed paths from the final Swagger Specification
 */
export class PathsWhitelister implements PostProcess {

  constructor(private pathPatterns: (string | RegExp)[] = []) {}

  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    const spec = { ...swaggerSpec};
    spec.paths = Object.keys(spec.paths)
      .filter((p) => this.pathPatterns
        .some((pattern) => {
          if (typeof pattern === 'string') {
            return p === pattern;
          } else {
            return pattern.test(p);
          }
        })
      )
      .reduce<any>((acc, p) => {
        acc[p] = spec.paths[p];
        return acc;
      }, {});

    return spec;
  }

}
