import type {
  Context,
} from '../../context.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Specification file as supported by {@link https://redocly.com/| Redocly}
 */
export type SpecificationFile = Record<string, any>;

/**
 * Transform a specification with specified transformation function
 */
export type Transform<S extends SpecificationFile = SpecificationFile, T = any> = (specification: S, retrievedModel: RetrievedDependencyModel, context: Context) => T | Promise<T>;
