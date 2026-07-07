import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CongratulationsStep,
} from './congratulations-step';

describe('CongratulationsStep', () => {
  let component: CongratulationsStep;
  let fixture: ComponentFixture<CongratulationsStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CongratulationsStep],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(CongratulationsStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
