/** Type of a message exchanged within the Otter Framework */
export const otterMessageType = 'otter';

/** Target of a message that should be handled by the application */
export const applicationMessageTarget = 'app';

export interface OtterMessageContent<DataType extends string = string> {
  /** Type of data */
  dataType: DataType;
}

export interface OtterMessage<Content extends OtterMessageContent = OtterMessageContent, Target extends string | undefined = undefined | string> {
  /** Type of the message */
  type: typeof otterMessageType;

  /** Version of the message (default to the @o3r/core version ) */
  version?: string;

  /** Target of the message */
  to: Target;

  /** Message content */
  content: Content;
}

/** Type helper to retrieve the data types of a union of MessageContent */
export type MessageDataTypes<T extends OtterMessageContent> = T['dataType'];

/** Type helper to filter the message that can be received by the application */
export type FilterMessageToApplication<T extends OtterMessage> = T extends { to: infer U } ? U extends (typeof applicationMessageTarget | undefined) ? T : never : never;

export type ContentMessageData<T extends OtterMessageContent> = T extends any
  ? Omit<T, 'dataType'>
  : never;
