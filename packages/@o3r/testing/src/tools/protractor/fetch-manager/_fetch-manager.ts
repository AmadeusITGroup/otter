/**
 * Note: This file is not part of the running script, it is injected in the browser while running e2e tests.
 */
(() => {
  /**
   * FetchManager permits to access the number of pending fetch requests on the browser.
   *
   * Usage: FetchManager is a singleton and needs to be injected in the browser and initiliazed by calling
   * `FetchManager.getInstance().init()` when the flow is started. Then it is possible to access the number of pending
   * fetchs or wait for all fetchs to be resolved.
   */
  type Timer = ReturnType<typeof setTimeout>;

  const MAX_WAITING_TIME_FOR_FETCH = 45 * 1000; // 45 seconds

  const fetchManager = class FetchManager {
    // eslint-disable-next-line no-use-before-define
    private static _instance: FetchManager;
    private nbCurrentFetch = 0;
    private windowFetch: any;

    private constructor() {}

    private interceptor(ref: FetchManager, nativeFetch: any, ...args: any[]) {
      let promise = Promise.resolve(args);
      promise = promise.then(
        () => {
          ref.nbCurrentFetch++;
          return [args[0], args[1]];
        },
        (error) => {
          return Promise.reject(error);
        });
      promise = promise.then(() => nativeFetch(...args));
      promise = promise.then(
        (response) => {
          ref.nbCurrentFetch--;
          return response;
        },
        (error) => {
          ref.nbCurrentFetch--;
          return Promise.reject(error);
        });
      return promise;
    }

    /**
     * Register the fetchs events to count the number of pending fetchs.
     */
    private registerFetchInterceptor() {
      const nativeFetch = window.fetch;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      Object.assign(window, {fetch: (...args: any[]) => this.interceptor(that, nativeFetch, ...args)});
    }

    private unregisterFetchInterceptor() {
      Object.assign(window, {fetch: this.windowFetch});
    }

    /**
     * Returns the single instance of FetchManager
     */
    public static getInstance() {
      return this._instance || (this._instance = new this());
    }

    /**
     * Initialize the fetch manager
     */
    public init() {
      this.nbCurrentFetch = 0;
      this.registerFetchInterceptor();
    }

    /**
     *
     */
    public stop() {
      this.nbCurrentFetch = 0;
      this.unregisterFetchInterceptor();
    }

    /**
     * Get the number of active fetchs on the page.
     */
    public getPendingFetchs() {
      return this.nbCurrentFetch;
    }

    /**
     * This function waits for all fetchs calls to be resolved and the page to be stable to call the callback.
     * It permits to easily run synchronous tests with protractor.
     * This is very usefull in the case of Otter calls to backend because protractor synchronization manager do not care
     * about fetchs calls. As a consequence, the `waitForAngular` method will not work.
     *
     * @param callback : Callback called when all the fetchs are finished and the page is stable.
     * @param timeoutInterval : Interval in milliseconds between two checks of the number of pending fetchs
     */
    public waitForFetchs(callback: any, timeoutInterval = 100) {
      let interval: Timer | undefined;
      let timeout: Timer | undefined;

      if (!this.getPendingFetchs()) {
        callback();
        return;
      }

      const cancelPolling = () => {
        if (interval) {
          clearInterval(interval);
          interval = undefined;
        }

        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }

        // Handle polling result
        if (this.getPendingFetchs() > 0) {
          // Error case will just log in console
          // and allow to continue as o3r elements might be checking fetchManager
          // concurrently
          this.nbCurrentFetch = 0;
          callback();

          throw new Error('Fetch timeout. Please check network requests.');
        } else {
          callback();
        }
      };

      const polling = () => this.getPendingFetchs() > 0 || cancelPolling();

      interval = setInterval(polling, timeoutInterval);
      timeout = setTimeout(cancelPolling, MAX_WAITING_TIME_FOR_FETCH);
    }
  };

  if (!('fetchManager' in window)) {
    Object.assign(window, { fetchManager });
  }
})();
