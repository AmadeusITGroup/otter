import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  InPageNavPres,
} from './in-page-nav-pres';

describe('InPageNavPres', () => {
  let component: InPageNavPres;
  let fixture: ComponentFixture<InPageNavPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InPageNavPres]
    });
    fixture = TestBed.createComponent(InPageNavPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
