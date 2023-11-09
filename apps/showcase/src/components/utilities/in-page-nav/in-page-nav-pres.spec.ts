import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InPageNavPresComponent } from './in-page-nav-pres.component';

describe('InPageNavPresComponent', () => {
  let component: InPageNavPresComponent;
  let fixture: ComponentFixture<InPageNavPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InPageNavPresComponent]
    });
    fixture = TestBed.createComponent(InPageNavPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
