/**
 * Object that define how to serialize a specific state
 */
export interface Serializer<T> {
  serialize?: (obj: T) => any;
  deserialize?: (data?: any) => T;
  reviver?: (key: string, value: any) => any;
  replacer?: (key: string, value: any) => any;
  initialState?: T;
}

export class StateSerializer<T> implements Serializer<T> {
  public serialize?: (obj: T) => any;
  public deserialize?: (data?: any) => T;
  public replacer?: (key: string, value: any) => any;
  public initialState?: T;

  constructor(serializer: Serializer<T>) {
    this.serialize = serializer.serialize || this.serialize;
    this.deserialize = serializer.deserialize || this.deserialize;
    this.reviver = serializer.reviver || this.reviver;
    this.replacer = serializer.replacer || this.replacer;
    this.initialState = serializer.initialState || this.initialState;
  }

  public reviver = (_: string, value: any): any => value;
}

export interface LocalStateModel {
  /**
   * Temporary ID of the model in the dictionary
   */
  tid: string;
}

/**
 * Adds an `id` to the given type
 */
export type Idfy<T> = T & { id: string | number };

/**
 * Payload to update actions
 */
export interface UpdateActionPayload<T> {
  stateDetails: Partial<T>;
}

/**
 * Payload to set actions
 */
export interface SetActionPayload<T> {
  stateDetails: T;
}

/**
 * Payload to set state actions
 */
export interface SetStateActionPayload<T> {
  state: T;
}
/**
 * Payload to fail actions
 */
export interface FailActionPayload<T> {
  error?: T;
}

export type Keep<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * @deprecated please use {@link Keep} instead, will be removed in v13.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- deprecated
export type keep<T, K extends keyof T> = Keep<T, K>;

/** Payload to update entities actions */
export interface UpdateEntitiesActionPayload<T, K extends keyof T> {
  entities: Keep<T, K>[];
}

/** Payload to update entities actions with a field ID */
export interface UpdateEntitiesActionPayloadWithId<T extends { id: string | number }> {
  entities: Keep<T, 'id'>[];
}

/** Payload to update entities actions */
export interface UpdateEntityActionPayload<T, K extends keyof T> {
  entity: Keep<T, K>;
}

/** Payload to update entities actions with a field ID */
export interface UpdateEntityActionPayloadWithId<T extends { id: string | number }> {
  entity: Keep<T, 'id'>;
}

/** Payload to set entities and upsert entities actions */
export interface SetEntitiesActionPayload<T> {
  entities: T[];
}

/** Payload to set entity and upsert entity actions */
export interface SetEntityActionPayload<T> {
  entity: T;
}

/** Payload to fail entities actions */
export interface FailEntitiesActionPayload<T> extends FailActionPayload<T> {
  ids?: (string | number)[];
}

/**
 * Payload to clear the store in case of failure
 */
export interface ClearOnFailurePayload {
  /** Clear store on failure */
  clearOnFailure?: boolean;
}
