import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import {
  mockTranslationModules,
} from '@o3r/testing/localization';
import {
  FormsEmergencyContactPres,
} from './forms-emergency-contact-pres';

describe('FormsEmergencyContactPres', () => {
  let component: FormsEmergencyContactPres;
  let fixture: ComponentFixture<FormsEmergencyContactPres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsEmergencyContactPres, ...mockTranslationModules(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsEmergencyContactPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
