import type {
  DeclareMessages,
} from '@amadeus-it-group/microfrontends';
import type {
  BasicMessageConsumer,
} from '../managers/interfaces';

/**
 * Gets the available consumers and formats them into a {@link DeclareMessages} object.
 * @param consumers - The list of registered message consumers.
 * @returns The formatted DeclareMessages object.
 */
export const getAvailableConsumers = (consumers: BasicMessageConsumer[]) => {
  return {
    type: 'declare_messages',
    version: '1.0',
    messages: consumers.flatMap(({ type, supportedVersions }) => Object.keys(supportedVersions).map((version) => ({ type, version })))
  } satisfies DeclareMessages;
};
