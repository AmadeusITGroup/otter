import {
  AsyncPipe,
} from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ScrollBackTopPres,
} from './scroll-back-top-pres';

describe('ScrollBackTopPres', () => {
  let component: ScrollBackTopPres;
  let fixture: ComponentFixture<ScrollBackTopPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScrollBackTopPres, AsyncPipe]
    });
    fixture = TestBed.createComponent(ScrollBackTopPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
