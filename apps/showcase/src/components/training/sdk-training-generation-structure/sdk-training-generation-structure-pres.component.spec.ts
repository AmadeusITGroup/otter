import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingGenerationStructurePresComponent } from './sdk-training-generation-structure-pres.component';

describe('SdkTrainingGenerationStructureComponent', () => {
  let component: SdkTrainingGenerationStructurePresComponent;
  let fixture: ComponentFixture<SdkTrainingGenerationStructurePresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingGenerationStructurePresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingGenerationStructurePresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
