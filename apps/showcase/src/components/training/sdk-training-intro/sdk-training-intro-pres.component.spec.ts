import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingIntroPresComponent } from './sdk-training-intro-pres.component';

describe('SdkTrainingIntroComponent', () => {
  let component: SdkTrainingIntroPresComponent;
  let fixture: ComponentFixture<SdkTrainingIntroPresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingIntroPresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingIntroPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
