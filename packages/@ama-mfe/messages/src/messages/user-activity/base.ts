/** The user activity message type used for communication between shell and iframes */
export const USER_ACTIVITY_MESSAGE_TYPE = 'user_activity';

/**
 * Types of user activity events that can be tracked
 */
export type UserActivityEventType =
  | 'click'
  | 'keydown'
  | 'scroll'
  | 'touchstart'
  | 'focus'
  | 'visibilitychange'
  | 'iframeinteraction';
