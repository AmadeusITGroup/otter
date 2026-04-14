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
 * Test component simulating an iframe with body set to height: 100% and overflow: auto.
 */
@Component({
  imports: [ScalableDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scrollable-container" style="overflow: auto; height: 600px;">
      <div class="iframe-element" [scalable]="channelId" style="height: 100%;">
        <div class="module-body" style="height: 100%; overflow: auto;">
          <div class="content" [style.height.px]="contentHeight"></div>
        </div>
      </div>
    </div>
  `
})
class BodyFullHeightTestComponent {
  public channelId = 'test-channel';
  public contentHeight = 400;
}

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn()
}));

/**
 * Tests for scalable directive when the module body has height: 100% and overflow: auto.
 * The directive uses min-height (not height) so the iframe can expand to fill the container.
 */
describe('ScalableDirective - Body Full Height', () => {
  let fixture: ComponentFixture<BodyFullHeightTestComponent>;
  let component: BodyFullHeightTestComponent;
  let iframeElement: DebugElement;
  let newHeightFromChannelSignal: WritableSignal<{ channelId: string; height: number } | undefined>;

  beforeEach(() => {
    newHeightFromChannelSignal = signal<{ channelId: string; height: number } | undefined>(undefined);
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: newHeightFromChannelSignal
    };

    TestBed.configureTestingModule({
      imports: [BodyFullHeightTestComponent, ScalableDirective],
      providers: [
        Renderer2,
        { provide: ResizeConsumerService, useValue: resizeHandlerServiceMock }
      ]
    });

    fixture = TestBed.createComponent(BodyFullHeightTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    iframeElement = fixture.debugElement.query(By.directive(ScalableDirective));
  });

  it('should set min-height from channel message', () => {
    const renderer = iframeElement.injector.get(Renderer2);
    const rendererSpy = jest.spyOn(renderer, 'setStyle');

    newHeightFromChannelSignal.set({ height: 600, channelId: 'test-channel' });
    fixture.detectChanges();

    expect(rendererSpy).toHaveBeenCalledWith(iframeElement.nativeElement, 'min-height', '600px');
  });

  it('should not update min-height when content changes but body height stays 100%', () => {
    const renderer = iframeElement.injector.get(Renderer2);
    const rendererSpy = jest.spyOn(renderer, 'setStyle');

    newHeightFromChannelSignal.set({ height: 600, channelId: 'test-channel' });
    fixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(iframeElement.nativeElement, 'min-height', '600px');

    rendererSpy.mockClear();

    component.contentHeight = 1200;
    fixture.detectChanges();

    expect(rendererSpy).not.toHaveBeenCalledWith(iframeElement.nativeElement, 'min-height', '1200px');
  });
});
