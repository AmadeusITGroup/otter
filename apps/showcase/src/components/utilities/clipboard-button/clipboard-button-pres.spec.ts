import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipboardButtonPresComponent } from './clipboard-button-pres.component';

describe('ClipboardButtonPresComponent', () => {
  let component: ClipboardButtonPresComponent;
  let fixture: ComponentFixture<ClipboardButtonPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClipboardButtonPresComponent]
    });
    fixture = TestBed.createComponent(ClipboardButtonPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
