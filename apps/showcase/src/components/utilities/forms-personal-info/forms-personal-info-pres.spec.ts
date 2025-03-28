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
  FormsPersonalInfoPresComponent,
} from './forms-personal-info-pres.component';

describe('FormsPersonalInfoPresComponent', () => {
  let component: FormsPersonalInfoPresComponent;
  let fixture: ComponentFixture<FormsPersonalInfoPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsPersonalInfoPresComponent, ...mockTranslationModules(), ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormsPersonalInfoPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
