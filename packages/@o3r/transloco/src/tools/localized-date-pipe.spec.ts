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
  LocalizedDatePipe,
} from '@o3r/transloco';

const currentLanguage = new BehaviorSubject('fr');
const showKeysSignal = signal(true);

describe('LocalizedDatePipe', () => {
  let pipe: LocalizedDatePipe;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
    showKeysSignal.set(true);
    TestBed.configureTestingModule({
      providers: [
        LocalizedDatePipe,
        {
          provide: ChangeDetectorRef, useClass: ChangeDetectorRefFixture
        },
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
    pipe = TestBed.inject(LocalizedDatePipe);
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
  });

  it('should display the format on showKeys mode', () => {
    expect(pipe.transform(new Date(2018, 11, 24), 'EEE, d MMM')).toBe('EEE, d MMM');
  });

  it('should format the date when showKeys is false', () => {
    showKeysSignal.set(false);
    currentLanguage.next('en');
    expect(pipe.transform(new Date(2018, 11, 24), 'EEE, d MMM')).toBe('Mon, 24 Dec');
  });

  it('should mark for check when the language changes', () => {
    currentLanguage.next('en');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });
});
