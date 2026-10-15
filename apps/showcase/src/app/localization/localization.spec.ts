import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  provideRouter,
} from '@angular/router';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  LocalizationService,
} from '@o3r/transloco';
import {
  provideMarkdown,
} from 'ngx-markdown';
import {
  Localization,
} from './localization';

const localizationConfiguration = { language: 'en' };
const mockTranslations = {
  en: {}
};
describe('Localization', () => {
  let component: Localization;
  let fixture: ComponentFixture<Localization>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(async () => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [
        Localization,
        AsyncPipe
      ],
      providers: [
        provideRouter([]),
        LocalizationService,
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService },
        provideMarkdown(),
        provideLocalizationMock(localizationConfiguration, mockTranslations)
      ]
    });
    fixture = TestBed.createComponent(Localization);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const localizationService = TestBed.inject(LocalizationService);
    await localizationService.configure();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
