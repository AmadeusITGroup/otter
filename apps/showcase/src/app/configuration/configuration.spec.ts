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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        Configuration,
        StoreModule.forRoot(),
        RouterModule.forRoot([]),
        AsyncPipe
      ],
      providers: [provideMarkdown()]
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
