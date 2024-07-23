import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingGenerationConfigPresComponent } from './sdk-training-generation-config-pres.component';

describe('SdkTrainingGenerationConfigComponent', () => {
  let component: SdkTrainingGenerationConfigPresComponent;
  let fixture: ComponentFixture<SdkTrainingGenerationConfigPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingGenerationConfigPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingGenerationConfigPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
