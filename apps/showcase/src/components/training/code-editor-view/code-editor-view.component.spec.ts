import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  CodeEditorViewComponent,
} from './code-editor-view.component';

describe('ViewComponent', () => {
  let component: CodeEditorViewComponent;
  let fixture: ComponentFixture<CodeEditorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorViewComponent]
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
