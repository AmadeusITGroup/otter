/**
 * A call to postMessage
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export interface PostMessageCall {
  /** Data passed in the message */
  data: any;
  /** Target origin passed in the message */
  targetOrigin: string;
  /** Timestamp of the message */
  timestamp: Date;
}

/**
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export type ConditionFn = (postCall: PostMessageCall) => boolean;
