import type {
  Message,
} from '@amadeus-it-group/microfrontends';
import type {
  ErrorContent,
} from './base';

/** An error message with the version 1.0 */
export interface ErrorMessage<S extends Message = Message> extends Message, ErrorContent<S> {
  type: 'error';
  version: '1.0';
}
