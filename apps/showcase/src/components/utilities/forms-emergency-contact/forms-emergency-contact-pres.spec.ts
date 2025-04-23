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
  FormsEmergencyContactPresComponent,
} from './forms-emergency-contact-pres.component';

describe('FormsEmergencyContactPresComponent', () => {
  let component: FormsEmergencyContactPresComponent;
  let fixture: ComponentFixture<FormsEmergencyContactPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsEmergencyContactPresComponent, ...mockTranslationModules(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsEmergencyContactPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
