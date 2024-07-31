import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MonacoTreeElement } from './ngx-monaco-tree.type';
import { ContextMenuAction } from './monaco-tree-file';

@Component({
  selector: 'monaco-tree',
  template: `
    <div [style]="'width:' + width + ';height:' + height" [class]="'monaco-tree ' + theme">
      <monaco-tree-file (contextMenuClick)="handleClickContextMenu($event)"
                        (clickFile)="handleClickFile($event)"
                        [theme]="theme"
                        *ngFor="let row of tree"
                        [name]="row.name"
                        [content]="row.content"
                        [depth]="0"
                        [hide]="false">
      </monaco-tree-file>
    </div>
	`,
  styleUrls: ['./ngx-monaco-tree.component.scss']
})
export class NgxMonacoTreeComponent {
  @Input() theme: 'vs-dark' | 'vs-light' = 'vs-dark';
	@Input() tree: MonacoTreeElement[] | null = [];

	@Input() width = '300px';
	@Input() height = '500px';

	@Output() clickFile = new EventEmitter<string>();
	@Output() clickContextMenu = new EventEmitter<ContextMenuAction>();

	handleClickFile(path: string) {
    this.clickFile.emit(path);
  }

	handleClickContextMenu(event: ContextMenuAction) {
    this.clickContextMenu.emit(event);
  }
}
