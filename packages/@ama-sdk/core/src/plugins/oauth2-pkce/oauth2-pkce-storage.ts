/**
 * OAuth 2.0 token set retrieved from the Authorization Server
 */
export interface OAuth2Token {
  /** Access token to send to the resource server (micro-gateway) */
  accessToken: string;
  /** Type of the token (usually `Bearer`) */
  tokenType: string;
  /** Timestamp (in ms) after which the access token is expired */
  expiresAt?: number;
  /** Refresh token, if provided by the Authorization Server */
  refreshToken?: string;
  /** ID token, if provided by the Authorization Server (OpenID Connect) */
  idToken?: string;
  /** Scope granted to the access token */
  scope?: string;
}

/**
 * Subset of the standard Web Storage API used by the plugin.
 * Implemented by the browser and the NodeJS `sessionStorage` / `localStorage`.
 * @see https://developer.mozilla.org/docs/Web/API/Storage
 * @see https://nodejs.org/api/globals.html#localstorage
 */
export type OAuth2SyncStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Asynchronous equivalent of the standard Web Storage API (IndexedDB wrapper, server-side store, etc.)
 */
export interface OAuth2AsyncStorage {
  /**
   * Retrieve the value associated to the key
   * @param key Key of the value
   * @returns the value, `null` or `undefined` if not found
   */
  getItem(key: string): Promise<string | null | undefined>;
  /**
   * Store the value associated to the key
   * @param key Key of the value
   * @param value Value to store
   */
  setItem(key: string, value: string): Promise<void>;
  /**
   * Remove the value associated to the key
   * @param key Key of the value
   */
  removeItem(key: string): Promise<void>;
}

/**
 * Storage accepted by the OAuth 2.0 PKCE plugin: standard Web Storage or its asynchronous equivalent
 */
export type OAuth2Storage = OAuth2SyncStorage | OAuth2AsyncStorage;

/**
 * In-memory implementation of the standard Web Storage API (recommended storage for the tokens).
 * The values are lost on page refresh: coupled with SSO, a new token is retrieved via a frictionless redirection.
 */
export class InMemoryStorage implements Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  private readonly items = new Map<string, string>();

  /** @inheritdoc */
  public get length() {
    return this.items.size;
  }

  /** @inheritdoc */
  public key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }

  /** @inheritdoc */
  public getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  /** @inheritdoc */
  public setItem(key: string, value: string) {
    this.items.set(key, String(value));
  }

  /** @inheritdoc */
  public removeItem(key: string) {
    this.items.delete(key);
  }

  /** @inheritdoc */
  public clear() {
    this.items.clear();
  }
}
