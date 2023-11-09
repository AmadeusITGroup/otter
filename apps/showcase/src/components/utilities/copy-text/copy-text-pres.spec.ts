import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyTextPresComponent } from './copy-text-pres.component';

describe('CopyTextPresComponent', () => {
  let component: CopyTextPresComponent;
  let fixture: ComponentFixture<CopyTextPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CopyTextPresComponent]
    });
    fixture = TestBed.createComponent(CopyTextPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
