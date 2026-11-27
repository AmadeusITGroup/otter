import {
  Component,
  DebugElement,
  provideZonelessChangeDetection,
  signal,
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
} from '../../../contracts';
import {
  EventTrackService,
} from '../../../services/event-track';
import {
  TrackClickDirective,
} from './track-click-directive';

const dummyEventContext = { eventInfo: { eventName: '', pageId: '', timeStamp: '' } };

@Component({
  template: '<button trackClick [trackEventContext]="eventModel()">Click</button>',
  imports: [TrackClickDirective],
  providers: [EventTrackService]
})
class TestComponent {
  public eventModel = signal(dummyEventContext);
}

describe('Track click directive:', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));
  let trackService: EventTrackService;
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let buttonElement: DebugElement;
  let addEventSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button'));
    trackService = fixture.debugElement.injector.get(EventTrackService);
    addEventSpy = jest.spyOn(trackService, 'addUiEvent');
  });

  it('should capture 2 events when the tracking mode is active', () => {
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('click'));
    buttonElement.nativeElement.dispatchEvent(new Event('click'));

    expect(addEventSpy).toHaveBeenCalledTimes(2);
  });

  it('should send the context object', () => {
    fixture.detectChanges();
    const dummyEvent = new Event('click');
    buttonElement.nativeElement.dispatchEvent(dummyEvent);
    const expectedEventPayload: UiEventPayload = { nativeEvent: dummyEvent, context: component.eventModel() };

    expect(addEventSpy).toHaveBeenCalledWith(expectedEventPayload);
  });

  it('should stop tracking when tracking mode is off', () => {
    trackService.toggleUiTracking(false);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('click'));

    expect(addEventSpy).not.toHaveBeenCalled();
  });

  it('should toggle the tracking mode', () => {
    trackService.toggleUiTracking(false);
    trackService.toggleUiTracking(true);
    fixture.detectChanges();
    buttonElement.nativeElement.dispatchEvent(new Event('click'));

    expect(addEventSpy).toHaveBeenCalledTimes(1);
  });

  it('should receive the new event context', () => {
    fixture.detectChanges();
    const event1 = new Event('click');
    buttonElement.nativeElement.dispatchEvent(event1);

    expect(addEventSpy).toHaveBeenCalledWith({ nativeEvent: event1, context: component.eventModel() });

    const newModel = {
      ...dummyEventContext,
      eventInfo: {
        ...dummyEventContext.eventInfo,
        eventName: 'newEvent'
      }
    };
    component.eventModel.set(newModel);
    fixture.detectChanges();
    const event2 = new Event('click');
    buttonElement.nativeElement.dispatchEvent(event2);

    expect(addEventSpy).toHaveBeenCalledWith({ nativeEvent: event2, context: newModel });
  });
});
