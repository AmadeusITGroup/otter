import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicPresComponent } from './basic-pres.component';

describe('BasicPresComponent', () => {
  let component: BasicPresComponent;
  let fixture: ComponentFixture<BasicPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BasicPresComponent]
    });
    fixture = TestBed.createComponent(BasicPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
