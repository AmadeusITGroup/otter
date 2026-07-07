import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ClipboardButtonPres,
} from './clipboard-button-pres';

describe('ClipboardButtonPres', () => {
  let component: ClipboardButtonPres;
  let fixture: ComponentFixture<ClipboardButtonPres>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClipboardButtonPres]
    });
    fixture = TestBed.createComponent(ClipboardButtonPres);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
