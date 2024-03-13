import { AsyncPipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder as mockBuilder,
  MockedComponentFixture,
  MockInstance as mockInstance,
  MockRender as mockRender,
  ngMocks
} from 'ng-mocks';
import { Subject } from 'rxjs';
import { SdkComponent } from './sdk.component';
import { InPageNavLink, InPageNavPresComponent, InPageNavPresService } from '../../components';

describe('SdkComponent', () => {
  let component: SdkComponent;
  let fixture: MockedComponentFixture<SdkComponent>;

  beforeEach(() => mockBuilder(SdkComponent).keep(AsyncPipe));

  it('should create', () => {
    fixture = mockRender(SdkComponent);
    component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should initialize inPageNavPresService', () => {
    fixture = mockRender(SdkComponent);
    component = fixture.point.componentInstance;
    const inPageNavPresService = TestBed.inject(InPageNavPresService);
    expect(inPageNavPresService.initialize).toHaveBeenCalledWith(expect.anything());
  });

  it('should update the links in the navigation area', () => {
    const linksSubject = new Subject<InPageNavLink[]>();
    mockInstance(InPageNavPresService, () => ({
      links$: linksSubject.asObservable()
    }));
    fixture = mockRender(SdkComponent);
    component = fixture.point.componentInstance;
    const navLinks = [{id: '1', label: 'id-1', scrollTo: jest.fn()}];
    linksSubject.next(navLinks);
    fixture.detectChanges();

    const pageNavigation = ngMocks.find<InPageNavPresComponent>('o3r-in-page-nav-pres').componentInstance;
    expect(pageNavigation.links).toBe(navLinks);
  });
});
