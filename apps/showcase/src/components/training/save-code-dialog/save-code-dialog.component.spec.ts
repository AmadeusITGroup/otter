import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  SaveCodeDialogComponent,
} from './save-code-dialog.component';

describe('ViewComponent', () => {
  let component: SaveCodeDialogComponent;
  let fixture: ComponentFixture<SaveCodeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveCodeDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
