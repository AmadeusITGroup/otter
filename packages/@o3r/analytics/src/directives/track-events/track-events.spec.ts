import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UiEventPayload } from '../../contracts';
import { EventTrackService } from '../../services/event-track';
import { TrackEventsModule } from './track-events.module';

@Component({
  template: `
    <button [trackEvents]="['mouseenter', 'mouseleave']" [trackEventContext]="{eventInfo: { eventName: '', pageId: '', timeStamp: ''}}">Click</button>`
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

  it('should send the context object', () => {
    fixture.detectChanges();
    const dummyEvent = new Event('mouseevent');
    buttonElement.triggerEventHandler('mouseleave', dummyEvent);
    const expectedEventPayload: UiEventPayload = {nativeEvent: dummyEvent, context: {eventInfo: { eventName: '', pageId: '', timeStamp: ''}}};

    expect(addEventSpy).toHaveBeenCalledWith(expectedEventPayload);
  });

  it('should capture the events when tracking mode is on', () => {
    fixture.detectChanges();
    buttonElement.triggerEventHandler('mouseenter', null);
    buttonElement.triggerEventHandler('mouseleave', null);

    expect(addEventSpy).toHaveBeenCalledTimes(2);
  });

  it('should stop tracking when tracking mode is off', () => {
    trackService.toggleUiTracking(false);
    fixture.detectChanges();
    buttonElement.triggerEventHandler('mouseenter', null);
    buttonElement.triggerEventHandler('mouseenter', null);

    expect(addEventSpy).not.toHaveBeenCalled();
  });

  it('should toggle the tracking mode', () => {
    trackService.toggleUiTracking(false);
    trackService.toggleUiTracking(true);
    fixture.detectChanges();
    buttonElement.triggerEventHandler('mouseenter', null);

    expect(addEventSpy).toHaveBeenCalledTimes(1);
  });
});
