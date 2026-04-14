import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NgbScrollSpyService,
} from '@ng-bootstrap/ng-bootstrap';
import {
  SdkIntro,
} from './sdk-intro';

describe('Sdk', () => {
  let component: SdkIntro;
  let fixture: ComponentFixture<SdkIntro>;
  let mockScrollSpyService: Partial<NgbScrollSpyService>;

  beforeEach(() => {
    mockScrollSpyService = {
      start: jest.fn(),
      stop: jest.fn()
    };
    TestBed.configureTestingModule({
      imports: [SdkIntro],
      providers: [
        { provide: NgbScrollSpyService, useValue: mockScrollSpyService }
      ]
    });
    fixture = TestBed.createComponent(SdkIntro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
