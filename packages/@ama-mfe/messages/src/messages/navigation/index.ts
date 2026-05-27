import type {
  NavigationV1_0,
  NavigationV1_1,
} from './navigation-versions';

export * from './navigation-versions';
export { NAVIGATION_MESSAGE_TYPE } from './base';

/** The versions of navigation messages */
export type NavigationMessage = NavigationV1_0 | NavigationV1_1;
