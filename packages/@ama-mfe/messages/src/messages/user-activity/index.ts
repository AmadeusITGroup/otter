import type {
  UserActivityMessageV1_0,
} from './user-activity-versions';

/** The versions of user activity messages */
export type UserActivityMessage = UserActivityMessageV1_0;
export * from './user-activity-versions';
export { USER_ACTIVITY_MESSAGE_TYPE, type UserActivityEventType } from './base';
