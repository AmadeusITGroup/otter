import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  SdkTrainingComponent,
} from './sdk-training.component';

describe('SdkTrainingComponent', () => {
  let component: SdkTrainingComponent;
  let fixture: ComponentFixture<SdkTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkTrainingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SdkTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
