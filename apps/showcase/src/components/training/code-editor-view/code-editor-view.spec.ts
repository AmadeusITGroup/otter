import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NGX_MONACO_EDITOR_CONFIG,
} from 'ngx-monaco-editor-v2';
import {
  CodeEditorView,
} from './code-editor-view';

describe('CodeEditorView', () => {
  let component: CodeEditorView;
  let fixture: ComponentFixture<CodeEditorView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorView],
      providers: [
        { provide: NGX_MONACO_EDITOR_CONFIG, useValue: { baseUrl: '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorView);
    fixture.componentRef.setInput('project', { startingFile: 'someFile', files: {}, commands: [], cwd: '' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
