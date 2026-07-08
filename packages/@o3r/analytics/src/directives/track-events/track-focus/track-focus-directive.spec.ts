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
} from '../../../contracts/index';
import {
  EventTrackService,
} from '../../../services/event-track/index';
import {
  TrackFocusDirective,
} from './track-focus-directive';

const dummyEventContext = { eventInfo: { eventName: '', pageId: '', timeStamp: '' } };

@Component({
  template: `<button trackFocus [trackEventContext]="eventModel">Click</button>`,
  imports: [TrackFocusDirective],
  providers: [EventTrackService]
})
class TestComponent {
  public eventModel = dummyEventContext;
}

describe('Track focus directive:', () => {
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

  it('should capture 2 events when the tracking mode is active', () => {
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('focus'));
    buttonElement.nativeElement.dispatchEvent(new Event('focus'));

    expect(addEventSpy).toHaveBeenCalledTimes(2);
  });

  it('should send the context object', () => {
    fixture.detectChanges();
    const dummyEvent = new Event('focus');
    buttonElement.nativeElement.dispatchEvent(dummyEvent);
    const expectedEventPayload: UiEventPayload = { nativeEvent: dummyEvent, context: dummyEventContext };

    expect(addEventSpy).toHaveBeenCalledWith(expectedEventPayload);
  });

  it('should stop tracking when tracking mode is off', () => {
    trackService.toggleUiTracking(false);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('focus'));

    expect(addEventSpy).not.toHaveBeenCalled();
  });

  it('should toggle the tracking mode', () => {
    trackService.toggleUiTracking(false);
    trackService.toggleUiTracking(true);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('focus'));

    expect(addEventSpy).toHaveBeenCalledTimes(1);
  });

  it('should receive the new event context', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const event1 = new Event('focus');
    buttonElement.nativeElement.dispatchEvent(event1);

    expect(addEventSpy).toHaveBeenCalledWith({ nativeEvent: event1, context: component.eventModel });

    const newModel = {
      ...dummyEventContext,
      eventInfo: {
        ...dummyEventContext.eventInfo,
        eventName: 'newEvent'
      }
    };
    component.eventModel = newModel;
    // In zoneless mode, we need to explicitly trigger change detection for the component
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    const event2 = new Event('focus');
    buttonElement.nativeElement.dispatchEvent(event2);

    expect(addEventSpy).toHaveBeenCalledWith({ nativeEvent: event2, context: newModel });
  });
});
