/**
 * Type expert to extend only public fields of a class
 */
export type InterfaceOf<T> = {[P in keyof T]: T[P]};
