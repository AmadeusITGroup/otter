import {Component, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import { extensions, files, folders} from '../utils';
import { MonacoTreeElement } from '../ngx-monaco-tree.type';
import {
  ContextMenuElementSeparator,
  ContextMenuElementText
} from '../monaco-tree-context-menu/monaco-tree-context-menu.type';
import {ContextMenuAction} from './monaco-tree-file.type';

function getAbsolutePosition(element: any) {
  const r = { x: element.offsetLeft, y: element.offsetTop };
  if (element.offsetParent) {
    const tmp = getAbsolutePosition(element.offsetParent);
    r.x += tmp.x;
    r.y += tmp.y;
  }
  return r;
}

@Component({
  selector: 'monaco-tree-file',
  templateUrl: './monaco-tree-file.component.html',
  styleUrls: ['./monaco-tree-file.component.scss']
})
export class MonacoTreeFileComponent {
	@Input() name = '';
	@Input() content: MonacoTreeElement[] | undefined | null = undefined;
	@Input() depth = 0;
	@Input() theme: 'vs-dark' | 'vs-light' = 'vs-dark';
	@Input() hide = false;

	@Output() clickFile = new EventEmitter<string>();
	@Output() contextMenuClick = new EventEmitter<ContextMenuAction>();

	public open = false;
	public position: [number, number] | undefined = undefined;
	public contextMenu: (ContextMenuElementSeparator | ContextMenuElementText)[] = [
	  {type: 'element', name: 'New File', action: () => {
	    this.contextMenuClick.emit(['new_file', this.name]);
	    this.position = [-1000, -1000];
	  } },
	  {type: 'element', name: 'New Directory', action: () => {
	    this.contextMenuClick.emit(['new_directory', this.name]);
	    this.position = [-1000, -1000];
	  } },
	  {type: 'separator' },
	  {type: 'element', name: 'Rename', action: () => {
	    this.contextMenuClick.emit(['rename_file', this.name]);
	    this.position = [-1000, -1000];
	  } },
	  {type: 'element', name: 'Delete', action: () => {
	    this.contextMenuClick.emit(['delete_file', this.name]);
	    this.position = [-1000, -1000];
	  } }
	];

	constructor(private readonly eRef: ElementRef) {}


	get icon() {
	  if (this.folder) {
	    if (Object.keys(folders).includes(this.name)) {
	      const icon = folders[this.name as keyof typeof folders];
	      if (this.open) {return icon + '-open';}
	      else {return icon;}
	    }
	    else {
	      if (this.open) {return 'folder-open';}
	      else {return 'folder';}
	    }
	  } else {
	    if (Object.keys(files).includes(this.name)) {
	      return files[this.name as keyof typeof files];

	    } else {
	      let splited = this.name.split('.');
	      while (splited.length > 0) {
	        splited = splited.slice(1);
	        const ext = splited.join('.');
	        if (ext && Object.keys(extensions).includes(ext)) {
	          return extensions[ext as keyof typeof extensions];
	        }
	      }
	      return 'file';
	    }

	  }
	}

	toggle() {
	  this.open = !this.open;
	  this.clickFile.emit(this.name);
	}

	get style() {
	  return 'margin-left: ' + 10 * this.depth + 'px';
	}

	get folder() {
	  return this.content !== null && this.content !== undefined;
	}

	handleClickFile(file: string) {
	  this.clickFile.emit(this.name + '/' + file);
	}

	// handleRightClickFile(e: MouseEvent) {
	// 	e.preventDefault()
	// 	this.rightClickFile.emit(e);
	// }

	handleRightClickFile(event: MouseEvent) {
	  event.preventDefault();
	  const pos = getAbsolutePosition(event.target);
	  this.position = [pos.x + event.offsetX, pos.y + event.offsetY];
	}

	handleRightClick(event: ContextMenuAction) {
	  this.contextMenuClick.emit([event[0], this.name + '/' + event[1]]);
	}

	@HostListener('document:contextmenu', ['$event'])
	clickOut(event: MouseEvent) {
	  if (!this.eRef.nativeElement.contains(event.target)) {
	    this.position = [-1000, -1000];
	  }
	}

}
