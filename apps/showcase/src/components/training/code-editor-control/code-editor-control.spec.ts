import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CodeEditorControl,
} from './code-editor-control';

describe('CodeEditorControl', () => {
  let component: CodeEditorControl;
  let fixture: ComponentFixture<CodeEditorControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorControl]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorControl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
