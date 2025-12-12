import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  BasicPres,
} from './basic-pres';

describe('BasicPres', () => {
  let component: BasicPres;
  let fixture: ComponentFixture<BasicPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BasicPres]
    });
    fixture = TestBed.createComponent(BasicPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
