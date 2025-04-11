import type {
  VersionedMessage,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from './base';

/** An error message with the version 1.0 */
export interface ErrorMessageV1_0<S extends VersionedMessage = VersionedMessage> extends VersionedMessage, ErrorContent<S> {
  /** @inheritdoc */
  type: 'error';
  /** @inheritdoc */
  version: '1.0';
}
