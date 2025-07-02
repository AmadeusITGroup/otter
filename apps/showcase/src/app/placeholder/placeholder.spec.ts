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
  PlaceholderComponent,
} from './placeholder.component';

describe('PlaceholderComponent', () => {
  let component: PlaceholderComponent;
  let fixture: ComponentFixture<PlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlaceholderComponent,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot()
      ]
    }).compileComponents();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          rulesets: []
        })
      })
    ) as jest.Mock;

    fixture = TestBed.createComponent(PlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
