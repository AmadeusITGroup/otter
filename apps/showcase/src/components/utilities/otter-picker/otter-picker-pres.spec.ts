import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  OtterPickerPres,
} from './otter-picker-pres';

describe('OtterPickerPres', () => {
  let component: OtterPickerPres;
  let fixture: ComponentFixture<OtterPickerPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OtterPickerPres]
    });
    fixture = TestBed.createComponent(OtterPickerPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
