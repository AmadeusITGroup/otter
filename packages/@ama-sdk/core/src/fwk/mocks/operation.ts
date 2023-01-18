/** Describes an API operation */
export interface Operation {
  /** The id of the operation (e.g. createCart) */
  operationId?: string;
  /** The HTTP method that describes the operation */
  method: string;
}
