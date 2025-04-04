import {
  Component,
  DebugElement,
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
} from './resize.consumer.service';
import {
  ScalableDirective,
} from './resize.directive';

@Component({
  imports: [ScalableDirective],
  template: `<div scalable></div>`
})
class TestComponent {}

describe('ScalableDirective', () => {
  let parentComponentFixture: ComponentFixture<TestComponent>;
  let directiveEl: DebugElement;
  let directiveInstance: ScalableDirective;
  let resizeHandlerService: ResizeConsumerService;

  beforeEach(() => {
    const resizeConsumerMock = {
      heightPx: jest.fn().mockReturnValue(200)
    };

    parentComponentFixture = TestBed.configureTestingModule({
      imports: [TestComponent, ScalableDirective]
    })
      .overrideDirective(ScalableDirective, {
        set: {
          providers: [{ provide: ResizeConsumerService, useValue: resizeConsumerMock }]
        }
      })
      .createComponent(TestComponent);

    parentComponentFixture.detectChanges();
    directiveEl = parentComponentFixture.debugElement.query(By.directive(ScalableDirective));
    directiveInstance = directiveEl.injector.get(ScalableDirective);
    resizeHandlerService = directiveEl.injector.get(ResizeConsumerService);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should set the height style on the element', () => {
    jest.spyOn(resizeHandlerService, 'heightPx').mockReturnValue(300);
    parentComponentFixture.detectChanges();
    expect(directiveEl.nativeElement.getAttribute('style')).toBe('height: 300px;');
  });

  it('should not set the height style on the element when heightPx is not available', () => {
    jest.spyOn(resizeHandlerService, 'heightPx').mockReturnValue(undefined);
    parentComponentFixture.detectChanges();
    expect(directiveEl.nativeElement.getAttribute('style')).toBe('');
  });
});
