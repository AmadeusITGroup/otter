import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  browser,
} from 'protractor';
import {
  ConditionFn,
  PostMessageCall,
} from './core';

/**
 * Controls the postMessage interceptor
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class PostMessageInterceptor {
  private readonly GET_INSTANCE = 'window.postMessageInterceptor.getInstance()';

  /**
   * Executes a script in the app
   * @param methodName
   * @param {...any} args
   */
  private async execInstanceMethod(methodName: string, ...args: any[]) {
    return await browser.executeScript(`${this.GET_INSTANCE}.${methodName}(...arguments);`, ...args);
  }

  /**
   * Executes an async script in the app
   * @param methodName
   * @param {...any} args
   */
  private async execInstanceAsyncMethod(methodName: string, ...args: any[]) {
    return await browser.executeAsyncScript(`${this.GET_INSTANCE}.${methodName}(...arguments);`, ...args);
  }

  /**
   * Initializes the PostMessageInterceptor in the app
   * NOTE: It does not start listening right away. You need to call listen()
   */
  public async initialize() {
    const fetchManager = fs.readFileSync(
      path.resolve(process.cwd(), 'node_modules', '@o3r', 'testing', 'tools', 'protractor', 'post-message-interceptor', '_post-message-interceptor.js'),
      {
        encoding: 'utf8'
      }
    );
    await browser.executeScript(fetchManager);
    await this.execInstanceMethod('init');
  }

  /**
   * Stops the PostMessageInterceptor.
   */
  public async stop() {
    await this.execInstanceMethod('stop');
  }

  /**
   * Listens for post messages
   * @param conditionFn an optional boolean function that will evaluate if the message should be saved or not in the stack
   */
  public async listen(conditionFn?: ConditionFn) {
    await this.execInstanceMethod('listen', conditionFn);
  }

  /**
   * Stops listening for post messages, resets the stack and clears the condition
   */
  public async stopListening() {
    await this.execInstanceMethod('stopListening');
  }

  /**
   * Get all the post messages
   * @param timeoutInterval Interval in milliseconds between two checks
   * @param retries How many retries to be executed (-1 for infinite retries)
   */
  public async getMessages(timeoutInterval = 100, retries = -1): Promise<PostMessageCall[]> {
    return (await this.execInstanceAsyncMethod('getMessages', timeoutInterval, retries)) as PostMessageCall[];
  }
}
