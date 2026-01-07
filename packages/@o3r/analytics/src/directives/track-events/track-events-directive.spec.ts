import {
  Component,
  DebugElement,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  ComponentFixture,
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  By,
} from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  UiEventPayload,
} from '../../contracts';
import {
  EventTrackService,
} from '../../services/event-track';
import {
  TrackEventsDirective,
} from './track-events-directive';

@Component({
  template: `<button [trackEvents]="['mouseenter', 'mouseleave']" [trackEventContext]="{eventInfo: { eventName: '', pageId: '', timeStamp: ''}}">Click</button>`,
  imports: [TrackEventsDirective],
  providers: [EventTrackService]
})
class TestComponent {}

describe('Track events directive:', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));
  let trackService: EventTrackService;
  let fixture: ComponentFixture<TestComponent>;
  let buttonElement: DebugElement;
  let addEventSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    buttonElement = fixture.debugElement.query(By.css('button'));
    trackService = fixture.debugElement.injector.get(EventTrackService);
    addEventSpy = jest.spyOn(trackService, 'addUiEvent');
  });

  it('should send the context object', () => {
    fixture.detectChanges();
    const dummyEvent = new Event('mouseleave');
    buttonElement.nativeElement.dispatchEvent(dummyEvent);
    const expectedEventPayload: UiEventPayload = { nativeEvent: dummyEvent, context: { eventInfo: { eventName: '', pageId: '', timeStamp: '' } } };

    expect(addEventSpy).toHaveBeenCalledWith(expectedEventPayload);
  });

  it('should capture the events when tracking mode is on', () => {
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('mouseenter'));
    buttonElement.nativeElement.dispatchEvent(new Event('mouseleave'));

    expect(addEventSpy).toHaveBeenCalledTimes(2);
  });

  it('should stop tracking when tracking mode is off', () => {
    trackService.toggleUiTracking(false);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('mouseenter'));
    buttonElement.nativeElement.dispatchEvent(new Event('mouseenter'));

    expect(addEventSpy).not.toHaveBeenCalled();
  });

  it('should toggle the tracking mode', () => {
    trackService.toggleUiTracking(false);
    trackService.toggleUiTracking(true);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('mouseenter'));

    expect(addEventSpy).toHaveBeenCalledTimes(1);
  });
});
