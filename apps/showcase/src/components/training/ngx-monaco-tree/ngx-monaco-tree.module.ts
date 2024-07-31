import { NgModule } from '@angular/core';
import { MonacoTreeFileComponent } from './monaco-tree-file';
import { NgxMonacoTreeComponent } from './ngx-monaco-tree.component';
import { MonacoTreeContextMenuComponent } from './monaco-tree-context-menu';
import { CommonModule } from '@angular/common';


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
