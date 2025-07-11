import type {
  Message,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from './base';

/** An error message with the version 1.0 */
export interface ErrorMessageV1_0<S extends Message = Message> extends Message, ErrorContent<S> {
  /** @inheritdoc */
  type: 'error';
  /** @inheritdoc */
  version: '1.0';
}
