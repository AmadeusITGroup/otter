import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEditorTerminalComponent } from './code-editor-terminal.component';

describe('ViewComponent', () => {
  let component: CodeEditorTerminalComponent;
  let fixture: ComponentFixture<CodeEditorTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditorTerminalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeEditorTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
