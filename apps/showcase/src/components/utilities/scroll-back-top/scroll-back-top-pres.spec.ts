import { AsyncPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollBackTopPresComponent } from './scroll-back-top-pres.component';

describe('ScrollBackTopPresComponent', () => {
  let component: ScrollBackTopPresComponent;
  let fixture: ComponentFixture<ScrollBackTopPresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScrollBackTopPresComponent, AsyncPipe]
    });
    fixture = TestBed.createComponent(ScrollBackTopPresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
