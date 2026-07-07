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
  C11nDirective,
  C11nMockService,
  C11nService,
} from '@o3r/components';
import {
  O3rElement,
} from '@o3r/testing/core';
import {
  ComponentReplacementPres,
} from './component-replacement-pres';
import {
  ComponentReplacementPresFixtureComponent,
} from './component-replacement-pres-fixture';

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
  ]
})
class MockC11nCVAStandaloneDirective {
  public writeValue = () => {};
  public registerOnChange = () => {};
  public registerOnTouched = () => {};
}

describe('ComponentReplacementPres', () => {
  let component: ComponentReplacementPres;
  let fixture: ComponentFixture<ComponentReplacementPres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ComponentReplacementPres
      ],
      providers: [{ provide: C11nService, useClass: C11nMockService }]
    }).overrideComponent(ComponentReplacementPres, {
      remove: { imports: [C11nDirective] },
      add: { imports: [MockC11nCVAStandaloneDirective] }
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentReplacementPres);
    component = fixture.componentInstance;

    componentFixture = new ComponentReplacementPresFixtureComponent(new O3rElement(fixture.debugElement));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(componentFixture).toBeTruthy();
  });
});
