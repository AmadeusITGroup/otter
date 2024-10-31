import {
  AsyncPipe
} from '@angular/common';
import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  RouterModule
} from '@angular/router';
import {
  O3rElement
} from '@o3r/testing/core';
import {
  DynamicContentComponent
} from './dynamic-content.component';
import {
  DynamicContentFixtureComponent
} from './dynamic-content.fixture';

let componentFixture: DynamicContentFixtureComponent;

describe('DynamicContentComponent', () => {
  let component: DynamicContentComponent;
  let fixture: ComponentFixture<DynamicContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DynamicContentComponent,
        RouterModule.forRoot([]),
        AsyncPipe
      ]
    });
    fixture = TestBed.createComponent(DynamicContentComponent);
    component = fixture.componentInstance;

    componentFixture = new DynamicContentFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
