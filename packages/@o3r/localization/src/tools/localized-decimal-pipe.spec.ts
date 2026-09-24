import type {
  Mock,
} from 'vitest';
import {
  ChangeDetectorRef,
} from '@angular/core';
import {
  getTestBed,
  TestBed,
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {
  BehaviorSubject,
} from 'rxjs';
import {
  LocalizationService,
  LocalizedDecimalPipe,
} from '@o3r/localization';

/**
 * Fixture for ChangeDetectorRef
 */
class ChangeDetectorRefFixture implements Readonly<ChangeDetectorRef> {
  public markForCheck: Mock;
  public detach: Mock;
  public detectChanges: Mock;
  public checkNoChanges: Mock;
  public reattach: Mock;

  constructor() {
    this.markForCheck = vi.fn();
    this.detach = vi.fn();
    this.detectChanges = vi.fn();
    this.checkNoChanges = vi.fn();
    this.reattach = vi.fn();
  }
}

const currentLanguage = new BehaviorSubject('fr');

describe('LocalizedDecimalPipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));
  let changeDetectorRef: ChangeDetectorRef;
  let pipe: LocalizedDecimalPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalizedDecimalPipe,
        { provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture },
        {
          provide: LocalizationService, useValue: {
            getCurrentLanguage: () => currentLanguage.getValue(),
            getTranslateService: () => ({
              onLangChange: currentLanguage
            })
          }
        }
      ]
    });
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
    pipe = TestBed.inject(LocalizedDecimalPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should mark for check when the language changes', () => {
    currentLanguage.next('en');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });
});
