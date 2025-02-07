import {
  Component,
} from '@angular/core';
import {
  ComponentFixture,
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  InterfaceOf,
} from '@o3r/core';
import {
  of,
} from 'rxjs';
import {
  O3rDynamicContentPipe,
} from './dynamic-content.pipe';
import {
  DynamicContentService,
} from './dynamic-content.service';

const serviceMock: InterfaceOf<DynamicContentService> = {
  basePath: '',
  getContentPathStream: jest.fn().mockReturnValue(of('fakeContentPath')),
  getMediaPathStream: jest.fn().mockReturnValue(of('fakeMediaPath'))
};

@Component({
  template: `{{'assets.png' | o3rDynamicContent}}`,
  standalone: false
})
class HostTestComponent {}

let fixture: ComponentFixture<HostTestComponent>;

describe('DynamicContentPipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [O3rDynamicContentPipe, HostTestComponent],
      providers: [{ provide: DynamicContentService, useValue: serviceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(HostTestComponent);
  });

  it('should call the service method', () => {
    fixture.detectChanges();

    expect(serviceMock.getMediaPathStream).toHaveBeenCalledWith('assets.png');
  });
});
