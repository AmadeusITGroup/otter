import {
  filter,
  map,
  Observable
} from 'rxjs';
import {
  applicationMessageTarget,
  ContentMessageData,
  FilterMessageToApplication,
  OtterMessage,
  OtterMessageContent,
  otterMessageType
} from './message.interfaces';

/**
 * Determine if a message should be handle by the application
 * @param message Message to analyze
 */
export const isToAppOtterMessage = <T extends OtterMessage>(message?: T): message is FilterMessageToApplication<T & { to: 'app' }> => {
  return message?.to === applicationMessageTarget;
};

/**
 * Determine if a message is emitted by an Otter tool
 * @param message Message to analyze
 */
export const isOtterMessage = <T extends OtterMessageContent>(message: any): message is OtterMessage<T> => {
  return message?.type === otterMessageType;
};

/**
 * Send an Otter Message
 * @param dataType Type of the message
 * @param content content of the message
 * @param preStringify determine if the message should JSON.stringify before being send (will use the default mechanism otherwise)
 */
export const sendOtterMessage = <T extends OtterMessageContent>(dataType: T['dataType'], content: ContentMessageData<T>, preStringify = true) => {
  const message = {
    type: otterMessageType,
    content: {
      ...content,
      dataType
    }
  };
  return window.postMessage(preStringify ? JSON.stringify(message) : message, '*');
};

export function filterMessageContent<T extends Event | MessageEvent>(): (source$: Observable<T>) => Observable<OtterMessageContent<string>>;
export function filterMessageContent<T extends Event | MessageEvent, S extends OtterMessageContent>(predicate: (message: any) => message is S): (source$: Observable<T>) => Observable<S>;
/**
 * Filter the Otter message that should be handle by the application and returns it content
 * @param predicate condition to filter the message
 * @returns content of the message
 */

/**
 *
 * @param predicate
 */
export function filterMessageContent<T extends Event | MessageEvent, S extends OtterMessageContent>(predicate?: (message: any) => message is S): (source$: Observable<T>) => Observable<OtterMessageContent<string> | S> {
  return (source$: Observable<T>) => {
    const obs = source$.pipe(
      map((event) => {
        const data = (event as MessageEvent).data;
        return typeof data === 'string' ? JSON.parse(data) : data;
      }),
      filter(isOtterMessage),
      filter(isToAppOtterMessage),
      map((message) => message.content)
    );
    if (predicate) {
      return obs.pipe(filter(predicate));
    }
    return obs;
  };
}
