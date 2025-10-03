import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DatePickerHebrewInputPres,
} from './date-picker-input-hebrew-pres';

describe('DatePickerHebrewInputPres', () => {
  let component: DatePickerHebrewInputPres;
  let fixture: ComponentFixture<DatePickerHebrewInputPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerHebrewInputPres]
    });
    fixture = TestBed.createComponent(DatePickerHebrewInputPres);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
