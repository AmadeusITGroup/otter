/** Type helper to ignore the constraint on literal union type (enum) of an SDK model */
// eslint-disable-next-line @typescript-eslint/ban-types
export type IgnoreEnum<T> = T extends string ? string : (T extends object ? {[p in keyof T]: IgnoreEnum<T[p]>} : T);
