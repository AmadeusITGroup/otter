import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingGenerationSetupPresComponent } from './sdk-training-generation-setup-pres.component';

describe('SdkTrainingGenerateEnvironmentComponent', () => {
  let component: SdkTrainingGenerationSetupPresComponent;
  let fixture: ComponentFixture<SdkTrainingGenerationSetupPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingGenerationSetupPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingGenerationSetupPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
