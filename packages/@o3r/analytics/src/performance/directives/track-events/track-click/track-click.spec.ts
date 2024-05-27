import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UiEventPayload } from '../../../contracts';
import { EventTrackService } from '../../../services/event-track';
import { TrackEventsModule } from '../track-events.module';

const dummyEventContext = {eventInfo: { eventName: '', pageId: '', timeStamp: ''}};

@Component({
  template: '<button trackClick [trackEventContext]="eventModel">Click</button>'
})
class TestComponent {
  public eventModel = dummyEventContext;
}

describe('Track click directive:', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));
  let trackService: EventTrackService;
  let fixture: ComponentFixture<TestComponent>;
  let buttonElement: DebugElement;
  let addEventSpy: jest.SpyInstance;

  beforeEach(async () => {
    return await TestBed.configureTestingModule({
      imports: [TrackEventsModule, RouterTestingModule],
      declarations: [TestComponent],
      providers: [EventTrackService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    buttonElement = fixture.debugElement.query(By.css('button'));
    trackService = fixture.debugElement.injector.get(EventTrackService);
    addEventSpy = jest.spyOn(trackService, 'addUiEvent');
  });

  it('should capture 2 events when the tracking mode is active', () => {
    fixture.detectChanges();
    buttonElement.triggerEventHandler('click', null);
    buttonElement.triggerEventHandler('click', null);

    expect(addEventSpy).toHaveBeenCalledTimes(2);
  });

  it('should send the context object', () => {
    fixture.detectChanges();
    const dummyEvent = new Event('click');
    buttonElement.triggerEventHandler('click', dummyEvent);
    const expectedEventPayload: UiEventPayload = {nativeEvent: dummyEvent, context: dummyEventContext};

    expect(addEventSpy).toHaveBeenCalledWith(expectedEventPayload);
  });

  it('should stop tracking when tracking mode is off', () => {
    trackService.toggleUiTracking(false);
    fixture.detectChanges();
    buttonElement.triggerEventHandler('click', null);

    expect(addEventSpy).not.toHaveBeenCalled();
  });

  it('should toggle the tracking mode', () => {
    trackService.toggleUiTracking(false);
    trackService.toggleUiTracking(true);
    fixture.detectChanges();
    buttonElement.triggerEventHandler('click', null);

    expect(addEventSpy).toHaveBeenCalledTimes(1);
  });

  it('should receive the new event context', () => {
    const component = fixture.componentInstance;
    fixture.detectChanges();
    buttonElement.triggerEventHandler('click', null);

    expect(addEventSpy).toHaveBeenCalledWith({nativeEvent: null, context: component.eventModel});

    const newModel = {
      ...dummyEventContext,
      eventInfo: {
        ...dummyEventContext.eventInfo,
        eventName: 'newEvent'
      }
    };
    component.eventModel = newModel;
    fixture.detectChanges();
    buttonElement.triggerEventHandler('click', null);

    expect(addEventSpy).toHaveBeenCalledWith({nativeEvent: null, context: newModel});
  });
});
