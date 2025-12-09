import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  RouterModule,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  StoreModule,
} from '@ngrx/store';
import {
  O3rElement,
} from '@o3r/testing/core';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  Configuration,
} from './configuration';
import {
  ConfigurationFixtureComponent,
} from './configuration-fixture';

let componentFixture: ConfigurationFixtureComponent;

describe('Configuration', () => {
  let component: Configuration;
  let fixture: ComponentFixture<Configuration>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(() => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [
        Configuration,
        StoreModule.forRoot(),
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown()
      ]
    });
    fixture = TestBed.createComponent(Configuration);
    component = fixture.componentInstance;

    componentFixture = new ConfigurationFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
