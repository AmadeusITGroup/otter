import {
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  BehaviorSubject,
} from 'rxjs';
import {
  ChangeDetectorRefFixture,
} from '../../testing/change-detector-ref-fixture';
import {
  LocalizationService,
  LocalizedCurrencyPipe,
} from '@o3r/transloco';

describe('LocalizedCurrencyPipe', () => {
  let localizedCurrencyPipe: LocalizedCurrencyPipe;
  let changeDetectorRef: ChangeDetectorRef;
  const currentLanguage = new BehaviorSubject('fr');
  const showKeysSignal = signal(false);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalizedCurrencyPipe,
        { provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture },
        {
          provide: LocalizationService,
          useValue: {
            getCurrentLanguage: () => currentLanguage.getValue(),
            getTranslateService: () => ({
              langChanges$: currentLanguage
            }),
            showKeys: showKeysSignal.asReadonly()
          }
        }
      ]
    });
    localizedCurrencyPipe = TestBed.inject(LocalizedCurrencyPipe);
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
  });

  it('should create an instance', () => {
    expect(localizedCurrencyPipe).toBeTruthy();
  });

  it('should mark for check when the language changes', () => {
    currentLanguage.next('en');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });
});
