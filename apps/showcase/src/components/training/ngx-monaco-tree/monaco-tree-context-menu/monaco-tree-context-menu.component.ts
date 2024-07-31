import {Component, ElementRef, HostListener, Input} from '@angular/core';
import {ContextMenuElementSeparator, ContextMenuElementText} from './monaco-tree-context-menu.type';

@Component({
  selector: 'monaco-tree-context-menu',
  templateUrl: './monaco-tree-context-menu.component.html',
  styleUrls: ['./monaco-tree-context-menu.component.scss']
})
export class MonacoTreeContextMenuComponent {
	@Input()
  public top: number | undefined;
	@Input()
	public left: number | undefined;

	@Input()
	public theme: 'vs-dark' | 'vs-light' = 'vs-dark';

	@Input()
	public elements: (ContextMenuElementSeparator | ContextMenuElementText)[] = [];

	constructor(private readonly eRef: ElementRef) {}

	@HostListener('document:click', ['$event'])
	clickout(event: MouseEvent) {
	  if (!this.eRef.nativeElement.contains(event.target)) {
	    this.top = -1000;
	    this.left = -1000;
	  }
	}
}
