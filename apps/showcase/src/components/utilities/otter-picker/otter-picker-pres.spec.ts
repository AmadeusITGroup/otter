import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  OtterPickerPresComponent,
} from './otter-picker-pres.component';

describe('OtterPickerPresComponent', () => {
  let component: OtterPickerPresComponent;
  let fixture: ComponentFixture<OtterPickerPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OtterPickerPresComponent]
    });
    fixture = TestBed.createComponent(OtterPickerPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
