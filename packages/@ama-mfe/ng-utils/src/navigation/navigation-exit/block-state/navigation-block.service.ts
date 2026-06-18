import {
  Injectable,
  signal,
  type Signal,
} from '@angular/core';

/**
 * Current navigation block state held by a module.
 */
export interface NavigationBlockState {
  /** `true` when the module holds unsaved work and navigation must be confirmed. */
  blocked: boolean;
  /** Optional reason displayed in the confirmation modal. */
  reason?: string;
}

/**
 * Module-side writable source of truth for the navigation block state.
 *
 * Feature code (forms, editors, etc.) calls {@link block} when unsaved changes appear and {@link unblock} once they are saved or discarded.
 * The {@link NavigationBlockStateProducerService} watches this signal and mirrors the state to the shell;
 * the {@link navigationBlockModuleGuard} reads it to decide whether to intercept in-module navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationBlockService {
  private readonly stateSignal = signal<NavigationBlockState>({ blocked: false });

  /** Readonly view of the current navigation block state. */
  public readonly state: Signal<NavigationBlockState> = this.stateSignal.asReadonly();

  /**
   * Mark the module as blocked (unsaved changes present).
   * @param reason Optional human-readable reason shown in the confirmation modal.
   */
  public block(reason?: string): void {
    this.stateSignal.set({ blocked: true, reason });
  }

  /** Mark the module as unblocked (no unsaved changes). */
  public unblock(): void {
    this.stateSignal.set({ blocked: false });
  }
}
