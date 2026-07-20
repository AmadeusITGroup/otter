import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  Renderer2,
  signal,
  type WritableSignal,
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

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

@Component({
  imports: [ScalableDirective],
  standalone: true,
  template: `<div [connect]="connect" [scalable]="scalableValue"></div>`
})
class TestComponent {
  public connect = 'testConnectId';
  public scalableValue: string | undefined = 'testScalableId';
}

describe('ScalableDirective', () => {
  let parentComponentFixture: ComponentFixture<TestComponent>;
  let directiveEl: DebugElement;
  let directiveInstance: ScalableDirective;
  let resizeHandlerService: ResizeConsumerService;
  let renderer: Renderer2;
  let newHeightFromChannelSignal: WritableSignal<{ channelId: string; height: number } | undefined>;

  beforeEach(() => {
    newHeightFromChannelSignal = signal<{ channelId: string; height: number } | undefined>({ height: 200, channelId: 'testScalableId' });
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: newHeightFromChannelSignal
    };

    parentComponentFixture = TestBed.configureTestingModule({
      imports: [TestComponent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }

      ]
    }).createComponent(TestComponent);

    parentComponentFixture.detectChanges();
    directiveEl = parentComponentFixture.debugElement.query(By.directive(ScalableDirective));
    directiveInstance = directiveEl.injector.get(ScalableDirective);
    resizeHandlerService = directiveEl.injector.get(ResizeConsumerService);
    renderer = directiveEl.injector.get(Renderer2);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should start the resize handler service on initialization', () => {
    expect(resizeHandlerService.start).toHaveBeenCalled();
  });

  it('should set the min-height style on the element with the channelId from scalable input', () => {
    const channelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set({ height: 300, channelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '300px');
    rendererSpy.mockClear();
  });

  it('should set the min-height style on the element with the channelId from connect input', () => {
    const channelId = 'connect-channel-id';
    newHeightFromChannelSignal.set({ height: 400, channelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = undefined;
    parentComponentFixture.componentInstance.connect = channelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '400px');
    rendererSpy.mockClear();
  });

  it('scalable input should take precedence over connect input', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set({ height: 400, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = scalableChannelId;
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '400px');
    rendererSpy.mockClear();
  });

  it('should not update the style if channelId does not match', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set({ height: 400, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = 'not-matching-channel-id';
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    // Note: The directive may still apply height from availableHeight (viewport),
    // so we check that the specific channel-based height was NOT applied
    expect(rendererSpy).not.toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '400px');
    rendererSpy.mockClear();
  });

  it('should not set the min-height style on the element when newHeightFromChannel is not available', () => {
    const channelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set(undefined);
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    expect(rendererSpy).not.toHaveBeenCalled();
    rendererSpy.mockClear();
  });

  it('should not set min-height from channel when height is undefined', () => {
    const channelId = 'test-channel';
    const rendererSpy = jest.spyOn(renderer, 'setStyle');

    newHeightFromChannelSignal.set({ channelId, height: undefined as unknown as number });
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();

    // Check that height undefined was not applied as a specific value
    expect(rendererSpy).not.toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', 'undefinedpx');
    rendererSpy.mockClear();
  });

  it('should not set min-height from channel when height is zero (falsy)', () => {
    const channelId = 'test-channel';
    const rendererSpy = jest.spyOn(renderer, 'setStyle');

    newHeightFromChannelSignal.set({ channelId, height: 0 });
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();

    // Check that 0px height was not applied
    expect(rendererSpy).not.toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '0px');
    rendererSpy.mockClear();
  });

  it('should not reapply the same height value', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set({ height: 1000, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = scalableChannelId;
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();

    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '1000px');

    // Trigger change detection again without changing the signal value
    rendererSpy.mockClear();
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();

    // Should not be called again with 1000px (cached)
    expect(rendererSpy).not.toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '1000px');
    rendererSpy.mockClear();
  });

  it('should apply new height when value changes', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    newHeightFromChannelSignal.set({ height: 1000, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = scalableChannelId;
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '1000px');

    // Update signal to different height
    newHeightFromChannelSignal.set({ height: 1100, channelId: scalableChannelId });
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();
    TestBed.tick();

    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '1100px');
    rendererSpy.mockClear();
  });

  it('should use ResizeObserver', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(global.ResizeObserver).toHaveBeenCalled();
  });
});

describe('ScalableDirective - Window Resize Handling', () => {
  const channelId = 'resize-test-channel';
  let parentComponentFixture: ComponentFixture<TestComponent>;
  let directiveEl: DebugElement;
  let renderer: Renderer2;
  let rendererSpy: jest.SpyInstance;

  beforeEach(() => {
    // Start with initial height of 300px
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: jest.fn().mockReturnValue({ channelId, height: 300 })
    };

    TestBed.configureTestingModule({
      imports: [TestComponent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }
      ]
    });

    parentComponentFixture = TestBed.createComponent(TestComponent);
    parentComponentFixture.componentInstance.scalableValue = channelId;
    directiveEl = parentComponentFixture.debugElement.query(By.directive(ScalableDirective));
    renderer = directiveEl.injector.get(Renderer2);
    rendererSpy = jest.spyOn(renderer, 'setStyle');

    parentComponentFixture.detectChanges();
  });

  it('should update height when window is resized', () => {
    // Verify initial height was applied
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '300px');

    // Mock getBoundingClientRect to simulate element position and calculate new available height
    const mockRect = { top: 100, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) };
    jest.spyOn(directiveEl.nativeElement, 'getBoundingClientRect').mockReturnValue(mockRect);

    // Change window.innerHeight to simulate resize (default is 768, new available height = 1200 - 100 = 1100)
    Object.defineProperty(window, 'innerHeight', { value: 1200, configurable: true });

    // Simulate window resize event
    window.dispatchEvent(new Event('resize'));

    // Trigger change detection and effects
    parentComponentFixture.detectChanges();
    TestBed.tick();

    // The directive should apply the new available height (1200 - 100 = 1100px)
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '1100px');
    rendererSpy.mockClear();
  });
});

describe('ScalableDirective - Mixed Height Sources', () => {
  const channelId = 'mixed-test-channel';
  let parentComponentFixture: ComponentFixture<TestComponent>;
  let directiveEl: DebugElement;
  let renderer: Renderer2;
  let rendererSpy: jest.SpyInstance;
  let newHeightFromChannelSignal: WritableSignal<{ channelId: string; height: number } | undefined>;

  beforeEach(() => {
    newHeightFromChannelSignal = signal<{ channelId: string; height: number } | undefined>({ height: 800, channelId });
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: newHeightFromChannelSignal
    };

    TestBed.configureTestingModule({
      imports: [TestComponent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }
      ]
    });

    parentComponentFixture = TestBed.createComponent(TestComponent);
    parentComponentFixture.componentInstance.scalableValue = channelId;
    directiveEl = parentComponentFixture.debugElement.query(By.directive(ScalableDirective));
    renderer = directiveEl.injector.get(Renderer2);
    rendererSpy = jest.spyOn(renderer, 'setStyle');

    parentComponentFixture.detectChanges();
  });

  it('should handle alternating height changes from channel and window resize', () => {
    // Initial channel height applied
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '800px');
    rendererSpy.mockClear();

    // Simulate window resize
    const mockRect = { top: 50, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) };
    jest.spyOn(directiveEl.nativeElement, 'getBoundingClientRect').mockReturnValue(mockRect);
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    jest.runAllTimers();
    window.dispatchEvent(new Event('resize'));
    parentComponentFixture.detectChanges();

    // Window resize should apply available height (800 - 50 = 750px)
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '750px');
    rendererSpy.mockClear();

    // Now update from channel with a different height
    newHeightFromChannelSignal.set({ height: 900, channelId });
    parentComponentFixture.changeDetectorRef.markForCheck();
    parentComponentFixture.detectChanges();

    // Channel height should be applied
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '900px');
    rendererSpy.mockClear();

    // Another window resize with different dimensions
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    jest.runAllTimers();
    window.dispatchEvent(new Event('resize'));
    parentComponentFixture.detectChanges();

    // Window resize should apply new available height (1000 - 50 = 950px)
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '950px');
  });
});

@Component({
  imports: [ScalableDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scrollable-parent" style="overflow: auto; height: 500px;">
      <div [scalable]="scalableValue"></div>
    </div>
  `
})
class TestComponentWithScrollableParent {
  public scalableValue: string | undefined = 'testScalableId';
}

describe('ScalableDirective with Scrollable Parent', () => {
  let fixture: ComponentFixture<TestComponentWithScrollableParent>;
  let directiveEl: DebugElement;
  let resizeHandlerService: ResizeConsumerService;

  beforeEach(() => {
    const scrollableParentSignal = signal<{ channelId: string; height: number } | undefined>(undefined);
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: scrollableParentSignal
    };

    fixture = TestBed.configureTestingModule({
      imports: [TestComponentWithScrollableParent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }
      ]
    }).createComponent(TestComponentWithScrollableParent);

    fixture.detectChanges();
    directiveEl = fixture.debugElement.query(By.directive(ScalableDirective));
    resizeHandlerService = directiveEl.injector.get(ResizeConsumerService);
  });

  it('should initialize directive and start resize handler service', () => {
    expect(directiveEl).toBeTruthy();
    expect(resizeHandlerService.start).toHaveBeenCalled();
  });

  it('should calculate available height from scrollable parent clientHeight', () => {
    const scrollableParent = fixture.debugElement.query(By.css('.scrollable-parent'));
    const renderer = directiveEl.injector.get(Renderer2);
    const rendererSpy = jest.spyOn(renderer, 'setStyle');

    // Mock the scrollable parent's clientHeight to 400px
    Object.defineProperty(scrollableParent.nativeElement, 'clientHeight', {
      value: 400,
      configurable: true
    });

    // Clear any previous calls
    rendererSpy.mockClear();

    // Mock element position - if viewport fallback were used, height would be (innerHeight - top) = 768 - 100 = 668px
    const mockRect = { top: 100, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) };
    jest.spyOn(directiveEl.nativeElement, 'getBoundingClientRect').mockReturnValue(mockRect);

    // Trigger a resize event to recalculate available height
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    // The directive should use the scrollable parent's clientHeight (400px)
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'min-height', '400px');
  });
});
