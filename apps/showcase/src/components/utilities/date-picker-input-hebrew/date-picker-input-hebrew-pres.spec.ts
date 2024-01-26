import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerHebrewInputPresComponent } from './date-picker-input-hebrew-pres.component';

describe('DatePickerHebrewInputPresComponent', () => {
  let component: DatePickerHebrewInputPresComponent;
  let fixture: ComponentFixture<DatePickerHebrewInputPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerHebrewInputPresComponent]
    });
    fixture = TestBed.createComponent(DatePickerHebrewInputPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
