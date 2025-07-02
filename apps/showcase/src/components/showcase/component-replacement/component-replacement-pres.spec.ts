import {
  Directive,
  forwardRef,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  C11nMockService,
  C11nModule,
  C11nService,
} from '@o3r/components';
import {
  O3rElement,
} from '@o3r/testing/core';
import {
  ComponentReplacementPresComponent,
} from './component-replacement-pres.component';
import {
  ComponentReplacementPresFixtureComponent,
} from './component-replacement-pres.fixture';

let componentFixture: ComponentReplacementPresFixtureComponent;

@Directive({
  selector: '[c11n]',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property -- mock in test
  inputs: ['config', 'component', 'inputs', 'outputs', 'formControl'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockC11nCVAStandaloneDirective),
      multi: true
    }
  ],
  standalone: true
})
class MockC11nCVAStandaloneDirective {
  public writeValue = () => {};
  public registerOnChange = () => {};
  public registerOnTouched = () => {};
}

describe('ComponentReplacementPresComponent', () => {
  let component: ComponentReplacementPresComponent;
  let fixture: ComponentFixture<ComponentReplacementPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ComponentReplacementPresComponent
      ],
      providers: [{ provide: C11nService, useClass: C11nMockService }]
    }).overrideComponent(ComponentReplacementPresComponent, {
      remove: { imports: [C11nModule] },
      add: { imports: [MockC11nCVAStandaloneDirective] }
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentReplacementPresComponent);
    component = fixture.componentInstance;

    componentFixture = new ComponentReplacementPresFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
