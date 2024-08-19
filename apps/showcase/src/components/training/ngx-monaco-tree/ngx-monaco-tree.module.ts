import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MonacoTreeContextMenuComponent } from './monaco-tree-context-menu';
import { MonacoTreeFileComponent } from './monaco-tree-file';
import { NgxMonacoTreeComponent } from './ngx-monaco-tree.component';


@NgModule({
  declarations: [
    NgxMonacoTreeComponent,
    MonacoTreeFileComponent,
    MonacoTreeContextMenuComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgxMonacoTreeComponent
  ]
})
export class NgxMonacoTreeModule { }
