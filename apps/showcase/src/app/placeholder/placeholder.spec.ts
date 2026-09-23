import type {
  Mock,
} from 'vitest';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  provideEffects,
} from '@ngrx/effects';
import {
  provideStore,
} from '@ngrx/store';
import {
  providePlaceholderRulesEngineAction,
} from '@o3r/components/rules-engine';
import {
  provideDynamicContent,
} from '@o3r/dynamic-content';
import {
  provideRulesEngineRunner,
} from '@o3r/rules-engine';
import {
  Placeholder,
} from './placeholder';

describe('Placeholder', () => {
  let component: Placeholder;
  let fixture: ComponentFixture<Placeholder>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(async () => {
    mockScrollSpyService = {
      start: vi.fn(),
      stop: vi.fn()
    };
    await TestBed.configureTestingModule({
      imports: [
        Placeholder
      ],
      providers: [
        provideStore(),
        provideEffects(),
        provideRulesEngineRunner(),
        providePlaceholderRulesEngineAction(),
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideDynamicContent()
      ]
    }).compileComponents();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          rulesets: []
        })
      })
    ) as Mock;

    fixture = TestBed.createComponent(Placeholder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
