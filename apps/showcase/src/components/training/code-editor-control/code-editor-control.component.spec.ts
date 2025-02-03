import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CodeEditorControlComponent,
} from './code-editor-control.component';

describe('ViewComponent', () => {
  let component: CodeEditorControlComponent;
  let fixture: ComponentFixture<CodeEditorControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorControlComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
