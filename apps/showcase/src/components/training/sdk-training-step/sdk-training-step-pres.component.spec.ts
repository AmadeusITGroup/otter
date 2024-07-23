import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingStepPresComponent } from './sdk-training-step-pres.component';

describe('SdkTrainingStepComponent', () => {
  let component: SdkTrainingStepPresComponent;
  let fixture: ComponentFixture<SdkTrainingStepPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingStepPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingStepPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
