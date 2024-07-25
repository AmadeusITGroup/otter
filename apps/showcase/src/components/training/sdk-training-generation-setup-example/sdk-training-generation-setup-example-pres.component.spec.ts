import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingGenerationSetupExamplePresComponent } from './sdk-training-generation-setup-example-pres.component';

describe('SdkTrainingGenerationSetupExampleComponent', () => {
  let component: SdkTrainingGenerationSetupExampleComponent;
  let fixture: ComponentFixture<SdkTrainingGenerationSetupExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingGenerationSetupExampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingGenerationSetupExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
