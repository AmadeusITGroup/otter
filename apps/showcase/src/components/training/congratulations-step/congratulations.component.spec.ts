import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CongratulationsStepComponent,
} from './congratulations-step.component';

describe('CongratulationsStep', () => {
  let component: CongratulationsStepComponent;
  let fixture: ComponentFixture<CongratulationsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongratulationsStepComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(CongratulationsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
