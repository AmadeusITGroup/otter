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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DynamicContent,
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [
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
