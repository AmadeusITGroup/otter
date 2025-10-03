import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DatePickerInputPres,
} from './date-picker-input-pres';

describe('DatePickerInputPres', () => {
  let component: DatePickerInputPres;
  let fixture: ComponentFixture<DatePickerInputPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerInputPres]
    });
    fixture = TestBed.createComponent(DatePickerInputPres);
    fixture.componentRef.setInput('id', 'test');
    fixture.componentRef.setInput('label', 'test-label');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
