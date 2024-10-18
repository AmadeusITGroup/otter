import {
  getTestBed,
  TestBed
} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import {
  LoggerClient
} from './logger.client';
import {
  ConsoleLogger
} from './logger.console';
import {
  LoggerModule
} from './logger.module';
import {
  LoggerService
} from './logger.service';
import {
  LOGGER_CLIENT_TOKEN
} from './logger.token';

describe('Logger service', () => {
  const consoleLogger = new ConsoleLogger();

  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  describe('by default', () => {
    let service: LoggerService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          LoggerModule.forRoot(consoleLogger)
        ]
      });

      service = TestBed.inject(LoggerService);
    });

    it('should report warning', () => {
      const spy = jest.spyOn(consoleLogger, 'warn');
      service.warn('warning', 'test');

      expect(spy).toHaveBeenCalledWith('warning', 'test');
    });

    it('should report error', () => {
      const spy = jest.spyOn(consoleLogger, 'error');
      service.error('error', 'test');

      expect(spy).toHaveBeenCalledWith('error', 'test');
    });
  });

  describe('with third-party client', () => {
    let service: LoggerService;
    let client: LoggerClient;

    beforeEach(() => {
      client = {
        identify: jest.fn(),
        event: jest.fn(),
        getSessionURL: jest.fn().mockReturnValue('client.session.url'),
        stopRecording: jest.fn(),
        resumeRecording: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn(),
        createMetaReducer: jest.fn()
      };

      TestBed.configureTestingModule({
        imports: [
          LoggerModule.forRoot(client)
        ]
      });

      service = TestBed.inject(LoggerService);
    });

    it('should identify user', () => {
      service.identify('123', { foo: 'bar' });

      expect(client.identify).toHaveBeenCalledWith('123', { foo: 'bar' });
    });

    it('should report event', () => {
      service.event('event name', { foo: 'bar' });

      expect(client.event).toHaveBeenCalledWith('event name', { foo: 'bar' });
    });

    it('should return session URL', () => {
      expect(service.getClientSessionURL()).toEqual('client.session.url');
    });

    it('should stop and resume recording', () => {
      service.stopClientRecording();

      expect(client.stopRecording).toHaveBeenCalled();

      service.resumeClientRecording();

      expect(client.resumeRecording).toHaveBeenCalled();
    });

    it('should report logs', () => {
      service.log('log', { foo: 'bar' });

      expect(client.log).toHaveBeenCalledWith('log', { foo: 'bar' });

      service.warn('warn', { foo: 'bar' });

      expect(client.warn).toHaveBeenCalledWith('warn', { foo: 'bar' });

      service.error('error', { foo: 'bar' });

      expect(client.error).toHaveBeenCalledWith('error', { foo: 'bar' });
    });

    it('should create a meta reducer', () => {
      service.createMetaReducer();

      expect(client.createMetaReducer).toHaveBeenCalled();
    });
  });

  describe('with multiple third-party client', () => {
    let service: LoggerService;
    let client1: LoggerClient;
    let client2: LoggerClient;
    describe('via forRoot', () => {
      beforeEach(() => {
        client1 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url1'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };
        client2 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url2'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };

        TestBed.configureTestingModule({
          imports: [
            LoggerModule.forRoot(client1, client2)
          ]
        });

        service = TestBed.inject(LoggerService);
      });

      it('should return session URL', () => {
        const urls = service.getClientSessionURL();
        expect(urls).toContain('client.session.url1');
        expect(urls).toContain('client.session.url2');
      });

      it('should stop and resume recording', () => {
        service.stopClientRecording();

        expect(client1.stopRecording).toHaveBeenCalled();
        expect(client2.stopRecording).toHaveBeenCalled();

        service.resumeClientRecording();

        expect(client1.resumeRecording).toHaveBeenCalled();
        expect(client2.resumeRecording).toHaveBeenCalled();
      });

      it('should make sure new registered client are consistent with the stop and resume recording status', () => {
        service.stopClientRecording();
        const client3 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url2'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };
        service.registerClient(client3);
        expect(client3.stopRecording).toHaveBeenCalled();
        expect(client3.stopRecording).toHaveBeenCalled();
        service.resumeClientRecording();
        const client4 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url2'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };
        service.registerClient(client4);
        expect(client4.resumeRecording).toHaveBeenCalled();
      });

      it('should report logs', () => {
        service.log('log', { foo: 'bar' });

        expect(client1.log).toHaveBeenCalledWith('log', { foo: 'bar' });
        expect(client2.log).toHaveBeenCalledWith('log', { foo: 'bar' });

        service.warn('warn', { foo: 'bar' });

        expect(client1.warn).toHaveBeenCalledWith('warn', { foo: 'bar' });
        expect(client2.warn).toHaveBeenCalledWith('warn', { foo: 'bar' });

        service.error('error', { foo: 'bar' });

        expect(client1.error).toHaveBeenCalledWith('error', { foo: 'bar' });
        expect(client2.error).toHaveBeenCalledWith('error', { foo: 'bar' });
      });
    });

    describe('via multi providers', () => {
      beforeEach(() => {
        client1 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url1'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };
        client2 = {
          identify: jest.fn(),
          event: jest.fn(),
          getSessionURL: jest.fn().mockReturnValue('client.session.url2'),
          stopRecording: jest.fn(),
          resumeRecording: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn(),
          createMetaReducer: jest.fn()
        };

        TestBed.configureTestingModule({
          imports: [
            LoggerModule
          ],
          providers: [
            { provide: LOGGER_CLIENT_TOKEN, useValue: client1, multi: true },
            { provide: LOGGER_CLIENT_TOKEN, useValue: client2, multi: true }
          ]
        });

        service = TestBed.inject(LoggerService);
      });

      it('should not register twice the same service', () => {
        class MyLogger implements LoggerClient {
          public identify = jest.fn();
          public event = jest.fn();
          public getSessionURL = jest.fn().mockReturnValue('client.session.url2');
          public stopRecording = jest.fn();
          public resumeRecording = jest.fn();
          public error = jest.fn();
          public warn = jest.fn();
          public log = jest.fn();
          public createMetaReducer = jest.fn();
        }

        const client = new MyLogger();
        jest.spyOn(service, 'warn');
        service.registerClient(client);
        service.registerClient(client);
        expect(service.warn).toHaveBeenCalledWith('Client MyLogger already registered');
        expect(client.warn).toHaveBeenCalledTimes(1);
      });

      it('should return session URL', () => {
        const urls = service.getClientSessionURL();
        expect(urls).toContain('client.session.url1');
        expect(urls).toContain('client.session.url2');
      });

      it('should stop and resume recording', () => {
        service.stopClientRecording();

        expect(client1.stopRecording).toHaveBeenCalled();
        expect(client2.stopRecording).toHaveBeenCalled();

        service.resumeClientRecording();

        expect(client1.resumeRecording).toHaveBeenCalled();
        expect(client2.resumeRecording).toHaveBeenCalled();
      });

      it('should report logs', () => {
        service.log('log', { foo: 'bar' });

        expect(client1.log).toHaveBeenCalledWith('log', { foo: 'bar' });
        expect(client2.log).toHaveBeenCalledWith('log', { foo: 'bar' });

        service.warn('warn', { foo: 'bar' });

        expect(client1.warn).toHaveBeenCalledWith('warn', { foo: 'bar' });
        expect(client2.warn).toHaveBeenCalledWith('warn', { foo: 'bar' });

        service.error('error', { foo: 'bar' });

        expect(client1.error).toHaveBeenCalledWith('error', { foo: 'bar' });
        expect(client2.error).toHaveBeenCalledWith('error', { foo: 'bar' });
      });
    });
  });
});
