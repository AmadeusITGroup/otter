import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  EffectsModule,
} from '@ngrx/effects';
import {
  StoreModule,
} from '@ngrx/store';
import {
  RulesEngineRunnerModule,
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
        PlaceholderPres,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot()
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
