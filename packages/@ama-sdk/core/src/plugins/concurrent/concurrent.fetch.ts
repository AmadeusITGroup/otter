import { FetchCall, FetchPlugin, FetchPluginContext } from '../core';

/**
 * Plugin to limit the number of concurrent call
 */
export class ConcurrentFetch implements FetchPlugin {

  /** Maximum number of concurrent call */
  public maxConcurrentPoolSize: number;

  /** Pool of pending fetch calls */
  public pool: FetchCall[] = [];

  /** Size of the pool of concurrent calls */
  private poolSize = 0;

  /** List of calls waiting to start */
  private readonly waitingResolvers: ((value: boolean) => void)[] = [];

  /**
   * Concurrent Fetch plugin
   * @param maxConcurrentPoolSize Maximum number of concurrent call
   */
  constructor(maxConcurrentPoolSize = 10) {
    this.maxConcurrentPoolSize = maxConcurrentPoolSize;
  }

  /**
   * Return true if a new call can start
   */
  private canStart() {
    return this.poolSize <= this.maxConcurrentPoolSize;
  }

  /**
   * Unstack and resolve the promise stopping the call to start
   */
  private unstackResolve() {
    if (this.canStart() && this.waitingResolvers.length) {
      this.waitingResolvers.shift()!(true);
    }
  }

  /** @inheritDoc */
  public load(_context: FetchPluginContext) {
    this.poolSize++;

    return {
      canStart: () => new Promise<boolean>((resolve) => this.canStart() ? resolve(true) : this.waitingResolvers.push(resolve)),

      transform: async (fetchCall: FetchCall) => {
        this.pool.push(fetchCall);

        try {
          const fetchResponse = await fetchCall;
          return fetchResponse;
        // eslint-disable-next-line no-useless-catch
        } catch (e) {
          throw e;
        } finally {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.pool = this.pool.filter((call) => call !== fetchCall);
          this.poolSize--;
          this.unstackResolve();
        }
      }
    };
  }

}
