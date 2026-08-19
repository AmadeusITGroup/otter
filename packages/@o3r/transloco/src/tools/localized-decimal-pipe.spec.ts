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
  LocalizedDecimalPipe,
} from '@o3r/transloco';

const currentLanguage = new BehaviorSubject('fr');
const showKeysSignal = signal(false);

describe('LocalizedDecimalPipe', () => {
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
              langChanges$: currentLanguage
            }),
            showKeys: showKeysSignal.asReadonly()
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
