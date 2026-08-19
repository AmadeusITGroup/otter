import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import {
  provideLocalizationMock,
} from '@o3r/testing/transloco';
import {
  FormsPersonalInfoPres,
} from './forms-personal-info-pres';

describe('FormsPersonalInfoPres', () => {
  let component: FormsPersonalInfoPres;
  let fixture: ComponentFixture<FormsPersonalInfoPres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsPersonalInfoPres, ReactiveFormsModule],
      providers: [provideLocalizationMock()]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsPersonalInfoPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
