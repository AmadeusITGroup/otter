/**
 * Interface of a runnable plugin
 */
export interface PluginRunner<T, V> {
  /** Transformation function */
  transform(data: V): T | Promise<T>;
}

/**
 * Interface of an async runnable plugin
 */
export interface PluginAsyncRunner<T, V> {
  /** Transformation function */
  transform(data: V): Promise<T>;
}

/**
 * Interface of a sync runnable plugin
 */
export interface PluginSyncRunner<T, V> {
  /** Transformation function */
  transform(data: V): T;
}

/**
 * Interface of an SDK plugin
 */
export interface Plugin<T, V> {
  /** Load the plugin with the context */
  load(context?: Record<string, any>): PluginRunner<T, V>;
}

/**
 * Interface of an async input for plugins
 */
export type AsyncPluginInput<T> = (() => Promise<T> | T) | Promise<T> | T;
