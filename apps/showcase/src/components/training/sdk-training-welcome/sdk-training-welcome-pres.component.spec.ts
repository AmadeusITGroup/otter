import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkTrainingWelcomePresComponent } from './sdk-training-welcome-pres.component';

describe('SdkTrainingWelcomeComponent', () => {
  let component: SdkTrainingWelcomePresComponent;
  let fixture: ComponentFixture<SdkTrainingWelcomePresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingWelcomePresComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingWelcomePresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
