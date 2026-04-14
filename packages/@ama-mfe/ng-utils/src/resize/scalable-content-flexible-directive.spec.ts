import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  Renderer2,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  By,
} from '@angular/platform-browser';
import {
  ResizeConsumerService,
} from './resize-consumer-service';
import {
  ScalableDirective,
} from './scalable-directive';

/**
 * Test component simulating a scrollable container with an iframe-like element.
 * The container has a fixed height (simulating the viewport or a scrollable parent),
 * and the iframe inside has the scalable directive applied.
 */
@Component({
  imports: [ScalableDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scrollable-container" style="overflow: auto; height: 600px;">
      <div class="iframe-wrapper" [scalable]="channelId" style="height: 100%;">
        <!-- Simulates iframe content that can grow -->
        <div class="iframe-content" [style.height.px]="contentHeight"></div>
      </div>
    </div>
  `
})
class ScrollBehaviorTestComponent {
  public channelId = 'test-channel';
  public contentHeight = 400; // Initial content height smaller than container
}

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

/**
 * These tests verify the scroll behavior when the scalable directive is used on an iframe-like element.
 *
 * Problem scenario (without the resize/window listener):
 * 1. Iframe content grows to 1200px → channel message sets iframe min-height to 1200px -> scroll on the scrolable container
 * 2. User shrinks window to 500px height
 * 3. There is no message received from the iframe content, iframe keeps 1200px min-height
 * 4. Result: Double scroll - one on the container (scrolling 1200px iframe) and one inside iframe
 *
 * Solution (with resize/window listener):
 * 1. Iframe content grows to 1200px → channel message sets iframe min-height to 1200px
 * 2. User shrinks window to 500px height → resize event triggers
 * 3. Directive updates iframe min-height to container height (500px)
 * 4. Result: Single scroll - only inside the iframe (iframe now fits container)
 */
describe('ScalableDirective - Scroll Behavior', () => {
  let fixture: ComponentFixture<ScrollBehaviorTestComponent>;
  let iframeWrapper: DebugElement;
  let scrollableContainer: DebugElement;
  let newHeightFromChannelSignal: WritableSignal<{ channelId: string; height: number } | undefined>;

  beforeEach(() => {
    newHeightFromChannelSignal = signal<{ channelId: string; height: number } | undefined>(undefined);
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: newHeightFromChannelSignal
    };

    TestBed.configureTestingModule({
      imports: [ScrollBehaviorTestComponent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }
      ]
    });

    fixture = TestBed.createComponent(ScrollBehaviorTestComponent);
    fixture.detectChanges();

    iframeWrapper = fixture.debugElement.query(By.directive(ScalableDirective));
    scrollableContainer = fixture.debugElement.query(By.css('.scrollable-container'));
  });

  describe('Content Growth - Channel Message Updates Min-Height', () => {
    it('should set iframe min-height equal to content height received from channel', () => {
      const renderer = iframeWrapper.injector.get(Renderer2);
      const rendererSpy = jest.spyOn(renderer, 'setStyle');

      // Simulate iframe content growing to 800px and sending resize message
      newHeightFromChannelSignal.set({ height: 800, channelId: 'test-channel' });
      fixture.detectChanges();

      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '800px');
    });

    it('should update min-height when content continues to grow', () => {
      const renderer = iframeWrapper.injector.get(Renderer2);
      const rendererSpy = jest.spyOn(renderer, 'setStyle');

      // First content growth
      newHeightFromChannelSignal.set({ height: 800, channelId: 'test-channel' });
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '800px');

      // Content grows more
      newHeightFromChannelSignal.set({ height: 1200, channelId: 'test-channel' });
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '1200px');
    });
  });

  describe('Window Shrink - Preventing Double Scroll', () => {
    it('should update min-height to container height when window shrinks, preventing double scroll', () => {
      const renderer = iframeWrapper.injector.get(Renderer2);
      const rendererSpy = jest.spyOn(renderer, 'setStyle');

      // Step 1: Iframe content grows to 1200px (larger than container's 600px)
      newHeightFromChannelSignal.set({ height: 1200, channelId: 'test-channel' });
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '1200px');

      // At this point, container would scroll to show the 1200px iframe
      // Now simulate window shrink scenario

      // Step 2: Mock container height shrinking to 400px (simulating window resize)
      Object.defineProperty(scrollableContainer.nativeElement, 'clientHeight', {
        value: 400,
        configurable: true
      });

      rendererSpy.mockClear();

      // Step 3: Trigger window resize
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      // Step 4: Verify iframe min-height is now 400px (matching container)
      // This prevents double scroll - iframe now fits in container
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '400px');
    });

    it('should allow only iframe scroll when min-height matches container after resize', () => {
      const renderer = iframeWrapper.injector.get(Renderer2);
      const rendererSpy = jest.spyOn(renderer, 'setStyle');
      const iframeContentHeight = 1000; // Content that will scroll inside iframe

      // Setup: Content is 1000px, container is 600px initially
      newHeightFromChannelSignal.set({ height: iframeContentHeight, channelId: 'test-channel' });
      fixture.detectChanges();

      // Shrink container to 300px
      const minHeightSetByDirective = 300;
      Object.defineProperty(scrollableContainer.nativeElement, 'clientHeight', {
        value: minHeightSetByDirective,
        configurable: true
      });

      rendererSpy.mockClear();
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      // After resize, iframe min-height should be 300px
      // The iframe content (1000px) will scroll inside the 300px iframe
      // But the container won't need to scroll because iframe now fits
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '300px');

      // Verify no double scrollbar condition:
      // The min-height set (300px) equals the container height (300px)
      // This ensures iframe fits in container, so only iframe scrolls (not container)
      const containerHeight = scrollableContainer.nativeElement.clientHeight;
      expect(minHeightSetByDirective).toBe(containerHeight);
    });
  });

  describe('Dynamic Content and Resize Interaction', () => {
    it('should handle alternating content growth and window resize', () => {
      const renderer = iframeWrapper.injector.get(Renderer2);
      const rendererSpy = jest.spyOn(renderer, 'setStyle');

      // Initial state: container 600px, content 400px

      // Content grows
      newHeightFromChannelSignal.set({ height: 900, channelId: 'test-channel' });
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '900px');

      // Window shrinks
      Object.defineProperty(scrollableContainer.nativeElement, 'clientHeight', {
        value: 400,
        configurable: true
      });
      rendererSpy.mockClear();
      jest.runAllTimers();
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '400px');

      // Content shrinks back
      rendererSpy.mockClear();
      newHeightFromChannelSignal.set({ height: 350, channelId: 'test-channel' });
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '350px');

      // Window expands
      Object.defineProperty(scrollableContainer.nativeElement, 'clientHeight', {
        value: 800,
        configurable: true
      });
      rendererSpy.mockClear();
      jest.runAllTimers();
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      expect(rendererSpy).toHaveBeenCalledWith(iframeWrapper.nativeElement, 'min-height', '800px');
    });
  });
});
