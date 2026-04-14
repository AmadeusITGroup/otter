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
  Subject,
} from 'rxjs';
import {
  NavigationConsumerService,
} from '../navigation-consumer-service';
import {
  RouteMemorizeDirective,
} from './route-memorize-directive';
import {
  RouteMemorizeService,
} from './route-memorize-service';

@Component({
  imports: [RouteMemorizeDirective],
  standalone: true,
  template: `<iframe [memorizeRoute]="memorizeRouteInput" [memorizeRouteId]="memorizeRouteId" [connect]="connect"
  [memorizeMaxAge]="memorizeMaxAge" [memorizeRouteMaxAge]="memorizeRouteMaxAge"></iframe>`
})
class ParentComponent {
  public memorizeRouteInput = true;
  public memorizeRouteId: any;
  public connect: any;
  public memorizeMaxAge = 0;
  public memorizeRouteMaxAge = 0;
}

describe('RouteMemorizeDirective', () => {
  let directiveEl: DebugElement;
  let directiveInstance: RouteMemorizeDirective;
  let routeMemorizeService: RouteMemorizeService;
  let parentComponentFixture: ComponentFixture<ParentComponent>;
  let parentComponentInstance: ParentComponent;
  let requestUrlSubject: Subject<{ url: string; channelId?: string }>;

  beforeEach(() => {
    requestUrlSubject = new Subject<{ url: string; channelId?: string }>();
    const routeMemorizeServiceMock = {
      memorizeRoute: jest.fn()
    };

    const navigationHandlerServiceMock = {
      requestedUrl$: requestUrlSubject.asObservable()
    };

    parentComponentFixture = TestBed.configureTestingModule({
      imports: [ParentComponent, RouteMemorizeDirective],
      providers: [
        { provide: RouteMemorizeService, useValue: routeMemorizeServiceMock },
        { provide: NavigationConsumerService, useValue: navigationHandlerServiceMock }
      ]
    }).createComponent(ParentComponent);

    requestUrlSubject.next({ channelId: 'testChannelId', url: 'testUrl' });
    parentComponentInstance = parentComponentFixture.componentInstance;
    routeMemorizeService = TestBed.inject(RouteMemorizeService);
    parentComponentFixture.detectChanges();
    directiveEl = parentComponentFixture.debugElement.query(By.directive(RouteMemorizeDirective));
    directiveInstance = directiveEl.injector.get(RouteMemorizeDirective);
  });

  it('should create an instance', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should not memorize route when memorizeRoute input is false', () => {
    parentComponentInstance.memorizeRouteInput = false;
    parentComponentFixture.detectChanges();

    expect(routeMemorizeService.memorizeRoute).not.toHaveBeenCalled();
  });
  it('should not memorize route if memorizeRoute is true but no id provided', () => {
    expect(routeMemorizeService.memorizeRoute).not.toHaveBeenCalled();
  });

  it('should not memorize route if memorizeRoute is true but the id (from connect input) provided does not match the channelId from requestedUrl', () => {
    parentComponentInstance.connect = 'testChannelIdNotMatch';
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).not.toHaveBeenCalled();
  });

  it('should call memorize route when passing the connect which matches the channelId from requestedUrl', () => {
    parentComponentInstance.connect = 'testChannelId';
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).toHaveBeenCalledWith('testChannelId', 'testUrl', 0);
  });

  it('memorizeRouteId should have greater priority then connect', () => {
    requestUrlSubject.next({ channelId: 'testChannelIdConnect', url: 'testUrl' });
    parentComponentInstance.memorizeRouteId = 'testChannelIdMemorizeId';
    parentComponentInstance.connect = 'testChannelIdConnect';
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).toHaveBeenCalledWith('testChannelIdMemorizeId', 'testUrl', 0);
  });

  it('should call memorize route with the memorizeMaxAge value', () => {
    parentComponentInstance.connect = 'testChannelId';
    parentComponentInstance.memorizeMaxAge = 10;
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).toHaveBeenCalledWith('testChannelId', 'testUrl', 10);
  });

  it('should call memorize route with the memorizeRouteMaxAge value', () => {
    parentComponentInstance.connect = 'testChannelId';
    parentComponentInstance.memorizeRouteMaxAge = 12;
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).toHaveBeenCalledWith('testChannelId', 'testUrl', 12);
  });

  it('memorizeMaxAge should take precedence over memorizeRouteMaxAge', () => {
    parentComponentInstance.connect = 'testChannelId';
    parentComponentInstance.memorizeMaxAge = 10;
    parentComponentInstance.memorizeRouteMaxAge = 12;
    parentComponentFixture.detectChanges();
    expect(routeMemorizeService.memorizeRoute).toHaveBeenCalledWith('testChannelId', 'testUrl', 10);
  });
});
