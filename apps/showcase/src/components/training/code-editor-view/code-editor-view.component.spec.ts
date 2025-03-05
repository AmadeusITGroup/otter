import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  NGX_MONACO_EDITOR_CONFIG,
} from 'ngx-monaco-editor-v2';
import {
  CodeEditorViewComponent,
} from './code-editor-view.component';

describe('CodeEditorViewComponent', () => {
  let component: CodeEditorViewComponent;
  let fixture: ComponentFixture<CodeEditorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorViewComponent],
      providers: [
        { provide: NGX_MONACO_EDITOR_CONFIG, useValue: { baseUrl: '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorViewComponent);
    fixture.componentRef.setInput('project', { startingFile: 'someFile', files: {}, commands: [], cwd: '' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
