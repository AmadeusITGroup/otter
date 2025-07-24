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
  LocalizedDatePipe,
} from './localized-date.pipe';
import {
  LocalizationService,
} from '@o3r/localization';

/**
 * Fixture for ChangeDetectorRef
 */
class ChangeDetectorRefFixture implements Readonly<ChangeDetectorRef> {
  public markForCheck: jest.Mock<any, any>;
  public detach: jest.Mock<any, any>;
  public detectChanges: jest.Mock<any, any>;
  public checkNoChanges: jest.Mock<any, any>;
  public reattach: jest.Mock<any, any>;

  constructor() {
    this.markForCheck = jest.fn();
    this.detach = jest.fn();
    this.detectChanges = jest.fn();
    this.checkNoChanges = jest.fn();
    this.reattach = jest.fn();
  }
}

const currentLanguage = new BehaviorSubject('fr');
describe('LocalizedDatePipe', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  let pipe: LocalizedDatePipe;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(() => {
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
              onLangChange: currentLanguage
            }),
            showKeys: true
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

  it('should mark for check when the language changes', () => {
    currentLanguage.next('en');
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });
});
