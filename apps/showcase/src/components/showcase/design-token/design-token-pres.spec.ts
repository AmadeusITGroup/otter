import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DesignTokenPres,
} from './design-token-pres';

describe('DesignTokenPres', () => {
  let component: DesignTokenPres;
  let fixture: ComponentFixture<DesignTokenPres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignTokenPres]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DesignTokenPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
