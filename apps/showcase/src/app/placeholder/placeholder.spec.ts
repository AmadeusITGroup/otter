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
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  RulesEngineRunnerModule,
} from '@o3r/rules-engine';
import {
  Placeholder,
} from './placeholder';

describe('Placeholder', () => {
  let component: Placeholder;
  let fixture: ComponentFixture<Placeholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Placeholder,
        StoreModule.forRoot(),
        EffectsModule.forRoot(),
        RulesEngineRunnerModule.forRoot()
      ],
      providers: [
        provideDynamicContent()
      ]
    }).compileComponents();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          rulesets: []
        })
      })
    ) as jest.Mock;

    fixture = TestBed.createComponent(Placeholder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
