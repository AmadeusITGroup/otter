/** A call to postMessage */
export interface PostMessageCall {
  /** Data passed in the message */
  data: any;
  /** Target origin passed in the message */
  targetOrigin: string;
  /** Timestamp of the message */
  timestamp: Date;
}

export type ConditionFn = (postCall: PostMessageCall) => boolean;
