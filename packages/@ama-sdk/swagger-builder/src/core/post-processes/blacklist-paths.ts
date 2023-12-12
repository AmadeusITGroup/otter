import { PostProcess } from './post-process.interface';

/**
 * Post Process to remove black listed paths from the final Swagger Specification
 */
export class PathsBlacklister implements PostProcess {

  constructor(private readonly pathPatterns: (string | RegExp)[] = []) {}

  /** @inheritdoc */
  public execute(swaggerSpec: any) {
    const spec = { ...swaggerSpec };
    spec.paths = Object.keys(spec.paths)
      .filter((p) => !this.pathPatterns
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
