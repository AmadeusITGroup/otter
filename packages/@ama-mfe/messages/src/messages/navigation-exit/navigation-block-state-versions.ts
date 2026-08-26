import type {
  VersionedNavigationBlockStateMessage,
} from './base';

/** Navigation block state content for version 1.0 */
export interface NavigationBlockStateContentV1_0 {
  /**
   * Should navigation be blocked.
   * @example `true` if the module has unsaved changes.
   */
  blocked: boolean;
  /** Optional human-readable reason displayed in the confirmation modal. */
  reason?: string;
}

/**
 * Reports the current navigation block state from a module to the shell.
 * Sent whenever the module toggles its block state (e.g. form becomes dirty or is saved).
 * The shell stores the last received value and uses it to decide whether shell-initiated navigation should be intercepted.
 */
export interface NavigationBlockStateV1_0 extends NavigationBlockStateContentV1_0, VersionedNavigationBlockStateMessage<'1.0'> {}
