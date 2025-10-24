import {
  Component,
  DebugElement,
  Renderer2,
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

  beforeEach(() => {
    const resizeHandlerServiceMock = {
      start: jest.fn(),
      newHeightFromChannel: jest.fn().mockReturnValue({ channelId: 'testScalableId', height: 200 })
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

  it('should set the height style on the element with the channelId from scalable input', () => {
    const channelId = 'scalable-channel-id';
    jest.spyOn(resizeHandlerService, 'newHeightFromChannel').mockReturnValue({ height: 300, channelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'height', '300px');
    rendererSpy.mockClear();
  });

  it('should set the height style on the element with the channelId from connect input', () => {
    const channelId = 'connect-channel-id';
    jest.spyOn(resizeHandlerService, 'newHeightFromChannel').mockReturnValue({ height: 400, channelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = undefined;
    parentComponentFixture.componentInstance.connect = channelId;
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'height', '400px');
    rendererSpy.mockClear();
  });

  it('scalable input should take precedence over connect input', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    jest.spyOn(resizeHandlerService, 'newHeightFromChannel').mockReturnValue({ height: 400, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = scalableChannelId;
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.detectChanges();
    expect(rendererSpy).toHaveBeenCalledWith(directiveEl.nativeElement, 'height', '400px');
    rendererSpy.mockClear();
  });

  it('should not update the style if channelId does not match', () => {
    const connectChannelId = 'connect-channel-id';
    const scalableChannelId = 'scalable-channel-id';
    jest.spyOn(resizeHandlerService, 'newHeightFromChannel').mockReturnValue({ height: 400, channelId: scalableChannelId });
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = 'not-matching-channel-id';
    parentComponentFixture.componentInstance.connect = connectChannelId;
    parentComponentFixture.detectChanges();
    expect(rendererSpy).not.toHaveBeenCalled();
    rendererSpy.mockClear();
  });

  it('should not set the height style on the element when newHeightFromChannel is not available', () => {
    const channelId = 'scalable-channel-id';
    jest.spyOn(resizeHandlerService, 'newHeightFromChannel').mockReturnValue(undefined);
    const rendererSpy = jest.spyOn(renderer, 'setStyle');
    parentComponentFixture.componentInstance.scalableValue = channelId;
    parentComponentFixture.detectChanges();
    expect(rendererSpy).not.toHaveBeenCalled();
    rendererSpy.mockClear();
  });
});
