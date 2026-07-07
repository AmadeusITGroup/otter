import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CodeEditorTerminal,
} from './code-editor-terminal';

describe('CodeEditorTerminal', () => {
  let component: CodeEditorTerminal;
  let fixture: ComponentFixture<CodeEditorTerminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorTerminal]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorTerminal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
