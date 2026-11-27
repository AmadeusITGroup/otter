import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideEffects,
} from '@ngrx/effects';
import {
  provideStore,
} from '@ngrx/store';
import {
  providePlaceholder,
} from '@o3r/components';
import {
  provideRulesEngineRunner,
} from '@o3r/rules-engine';
import {
  PlaceholderPres,
} from './placeholder-pres';

describe('PlaceholderPres', () => {
  let component: PlaceholderPres;
  let fixture: ComponentFixture<PlaceholderPres>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PlaceholderPres
      ],
      providers: [
        provideStore(),
        provideEffects(),
        provideRulesEngineRunner(),
        providePlaceholder()
      ]
    });
    fixture = TestBed.createComponent(PlaceholderPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
