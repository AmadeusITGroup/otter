import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainingStepPresComponent } from './training-step-pres.component';

describe('TrainingStepComponent', () => {
  let component: TrainingStepPresComponent;
  let fixture: ComponentFixture<TrainingStepPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStepPresComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingStepPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
