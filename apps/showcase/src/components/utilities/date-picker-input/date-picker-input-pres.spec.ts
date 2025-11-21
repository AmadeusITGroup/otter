import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DatePickerInputPresComponent,
} from './date-picker-input-pres.component';

describe('DatePickerInputPresComponent', () => {
  let component: DatePickerInputPresComponent;
  let fixture: ComponentFixture<DatePickerInputPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerInputPresComponent]
    });
    fixture = TestBed.createComponent(DatePickerInputPresComponent);
    fixture.componentRef.setInput('id', 'test');
    fixture.componentRef.setInput('label', 'test-label');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
