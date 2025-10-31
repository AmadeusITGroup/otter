import type {
  Logger,
} from '../../logger.mjs';
import type {
  RetrievedDependencyModel,
} from '../manifest/extract-dependency-models.mjs';

/**
 * Transform a specification with specified transformation function
 */
export type Transform<S extends object = object, T = any> = (specification: S, retrievedModel: RetrievedDependencyModel, logger?: Logger) => T | Promise<T>;
