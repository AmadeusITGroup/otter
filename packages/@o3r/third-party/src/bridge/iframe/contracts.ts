/**
 * Represents messages exchanged between host and iFrame.
 */
export interface IframeMessage {
  /**
   * String used to identify the type of action to perform.
   */
  action: string;

  /**
   * The version of the action, to allow for backward and forward compatibility.
   */
  version: string;

  /**
   * Payload of the message.
   */
  data?: unknown;
}

export interface InternalIframeMessage extends IframeMessage {
  /**
   * The ID associated to the channel Host <-> iFrame
   */
  channelId: string;

  /**
   * ID used to handle messages that expect a response from the other party.
   * No used for unidirectional messages.
   */
  id?: string;
}

/**
 * Options that can be passed to configure an IFrameBridge
 */
export interface IFrameBridgeOptions {
  /**
   * Number of times the Host will try to handshake with the iFrame before failing.
   */
  handshakeTries: number;

  /**
   * For a given handshake try, how long will the host wait for an answer before considering
   * that the try failed.
   */
  handshakeTimeout: number;

  /**
   * When sending a message that expects a response, how long should the Bridge wait before
   * considering there will be answer.
   */
  messageWithResponseTimeout: number;
}
