import {
  afterNextRender,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  fromEvent,
  throttleTime,
} from 'rxjs';
import {
  ResizeConsumerService,
} from './resize-consumer-service';

/**
 * A directive that adjusts the min-height of an element based on resize messages from a specified channel.
 *
 * This directive observes both resize messages from embedded modules and layout changes (window resize,
 * container resize via `ResizeObserver`) to dynamically set the element's min-height. This ensures:
 * - No blank space when the window or container grows (min-height fills available space)
 * - No double scrollbar when the window shrinks (element height adapts to available space)
 *
 * The available height is calculated by:
 * 1. Finding the nearest scrollable parent container and using its `clientHeight`
 * 2. Falling back to viewport calculation: `window.innerHeight - element's top position`
 *
 * The element's min-height is updated whenever:
 * - A resize message is received from the matching channel (using `scalable` or `connect` input as channel ID)
 * - The window is resized
 * - The parent container's size changes (detected via `ResizeObserver`)
 */
@Directive({
  selector: '[scalable]',
  standalone: true
})
export class ScalableDirective {
  /**
   * The connection ID for the element, used as channel id backup
   */
  public connect = input<string>();

  /**
   * The channel id
   */
  public scalable = input<string>();

  private readonly resizeHandler = inject(ResizeConsumerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elem = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /** Signal holding the current available container height */
  private readonly availableHeight = signal<number | undefined>(undefined);

  /** Tracks the last applied min-height to avoid redundant style updates */
  private lastAppliedMinHeight: number | undefined;

  /** ResizeObserver for watching parent container size changes */
  private resizeObserver?: ResizeObserver;

  /** Cached container element */
  private container: HTMLElement | null = null;

  /**
   * This signal checks if the current channel requesting the resize matches the channel ID from the resize handler.
   * If they match, it returns the new height information; otherwise, it returns undefined.
   */
  private readonly newHeightFromChannel = computed(() => {
    const channelAskingResize = this.scalable() || this.connect();
    const newHeightFromChannel = this.resizeHandler.newHeightFromChannel();
    if (channelAskingResize && newHeightFromChannel?.channelId === channelAskingResize) {
      return newHeightFromChannel;
    }
    return undefined;
  });

  constructor() {
    this.resizeHandler.start();

    // Start height observer after layout is complete (read phase ensures styles are applied)
    afterNextRender({
      read: () => this.startHeightObserver()
    });

    // Apply height from module's resize message
    effect(() => this.applyMinHeight(this.newHeightFromChannel()?.height));

    // Apply height from viewport when window/layout changes
    effect(() => this.applyMinHeight(this.availableHeight()));

    // Cleanup ResizeObserver on destroy
    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
    });
  }

  /**
   * Calculate the available height from the scrollable container.
   */
  private calculateAvailableHeight(): number | undefined {
    if (this.container) {
      return this.container.clientHeight || undefined;
    }

    // Fallback: use viewport
    const rect = this.elem.nativeElement.getBoundingClientRect();
    const availableHeight = window.innerHeight - rect.top;
    return availableHeight > 0 ? availableHeight : undefined;
  }

  /**
   * Find the nearest scrollable parent element.
   * @param element
   */
  private findScrollableParent(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const { overflowY, overflow } = style;
      if (overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  /**
   * Start observing size changes.
   */
  private startHeightObserver(): void {
    // Find and cache the scrollable container
    this.container = this.findScrollableParent(this.elem.nativeElement);
    this.observeWindowResize();

    this.resizeObserver = new ResizeObserver(() => this.updateAvailableHeight());
    this.resizeObserver.observe(this.container || document.body);

    this.updateAvailableHeight();
  }

  /**
   * Subscribe to window resize events and update the available height.
   */
  private observeWindowResize(): void {
    fromEvent(window, 'resize').pipe(
      throttleTime(16),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.updateAvailableHeight();
    });
  }

  /**
   * Update the available height signal with the current container height.
   */
  private updateAvailableHeight(): void {
    const height = this.calculateAvailableHeight();
    if (height && height !== this.availableHeight()) {
      this.availableHeight.set(height);
    }
  }

  /**
   * Apply min-height style only if defined and changed.
   * @param height
   */
  private applyMinHeight(height: number | undefined): void {
    if (height && height !== this.lastAppliedMinHeight) {
      this.lastAppliedMinHeight = height;
      this.renderer.setStyle(this.elem.nativeElement, 'min-height', `${height}px`);
    }
  }
}
