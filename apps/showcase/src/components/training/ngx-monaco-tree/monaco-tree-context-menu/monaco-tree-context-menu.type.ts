export interface ContextMenuElementSeparator {
	type: 'separator';
}

export interface ContextMenuElementText {
	type: 'element';
	action: () => void;
	name: string;
}
