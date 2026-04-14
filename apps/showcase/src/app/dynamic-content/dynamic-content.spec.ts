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
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  O3rElement,
} from '@o3r/testing/core';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  DynamicContent,
} from './dynamic-content';
import {
  DynamicContentFixtureComponent,
} from './dynamic-content-fixture';

let componentFixture: DynamicContentFixtureComponent;

describe('DynamicContent', () => {
  let component: DynamicContent;
  let fixture: ComponentFixture<DynamicContent>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(() => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [
        DynamicContent,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown(),
        provideDynamicContent()
      ]
    });
    fixture = TestBed.createComponent(DynamicContent);
    component = fixture.componentInstance;

    componentFixture = new DynamicContentFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
