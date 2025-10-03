import type {
  HistoryV1_0,
} from './history-versions';

export * from './history-versions';
export { HISTORY_MESSAGE_TYPE } from './base';

/** The versions of history messages */
export type HistoryMessage = HistoryV1_0;
