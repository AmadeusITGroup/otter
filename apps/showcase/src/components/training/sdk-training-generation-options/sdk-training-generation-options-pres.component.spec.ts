import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingGenerationOptionsPresComponent } from './sdk-training-generation-options-pres.component';

describe('SdkTrainingGenerationOptionsComponent', () => {
  let component: SdkTrainingGenerationOptionsPresComponent;
  let fixture: ComponentFixture<SdkTrainingGenerationOptionsPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingGenerationOptionsPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingGenerationOptionsPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
