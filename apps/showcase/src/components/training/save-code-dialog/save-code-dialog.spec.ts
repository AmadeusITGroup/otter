import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NgbActiveModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  SaveCodeDialog,
} from './save-code-dialog';

describe('SaveCodeDialog', () => {
  let component: SaveCodeDialog;
  let fixture: ComponentFixture<SaveCodeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveCodeDialog],
      providers: [NgbActiveModal]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveCodeDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
