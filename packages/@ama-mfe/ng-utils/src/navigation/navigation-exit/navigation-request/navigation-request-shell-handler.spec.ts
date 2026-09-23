import type {
  Mock,
} from 'vitest';
import {
  TestBed,
} from '@angular/core/testing';
import {
  NavigationBlockStateConsumerService,
} from '../block-state/navigation-block-state-consumer.service';
import {
  NavigationBlockConfirmationService,
} from '../navigation-confirmation/navigation-block-confirmation.service';
import {
  NAVIGATION_REQUEST_HANDLER,
} from './navigation-request-handler';
import {
  createNavigationRequestShellHandler,
  provideNavigationRequestShellHandler,
} from './navigation-request-shell-handler';

describe('createNavigationRequestShellHandler', () => {
  let confirmation: { confirm: Mock };
  let blockConsumer: { clear: Mock };

  beforeEach(() => {
    confirmation = { confirm: vi.fn() };
    blockConsumer = { clear: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: NavigationBlockConfirmationService, useValue: confirmation },
        { provide: NavigationBlockStateConsumerService, useValue: blockConsumer }
      ]
    });
  });

  it('should call the consumer clear when the user confirms', async () => {
    confirmation.confirm.mockResolvedValue(true);
    const handler = TestBed.runInInjectionContext(() => createNavigationRequestShellHandler());
    await handler.handle({ from: 'booking', reason: 'dirty' });
    expect(confirmation.confirm).toHaveBeenCalledWith('dirty');
    expect(blockConsumer.clear).toHaveBeenCalled();
  });

  it('should throw when the user cancels', async () => {
    confirmation.confirm.mockResolvedValue(false);
    const handler = TestBed.runInInjectionContext(() => createNavigationRequestShellHandler());
    await expect(handler.handle({ from: 'booking' })).rejects.toThrow();
    expect(blockConsumer.clear).not.toHaveBeenCalled();
  });
});

describe('provideNavigationRequestShellHandler', () => {
  it('should wire NAVIGATION_REQUEST_HANDLER to the shell handler factory', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NavigationBlockConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: NavigationBlockStateConsumerService, useValue: { clear: vi.fn() } },
        provideNavigationRequestShellHandler()
      ]
    });
    const handler = TestBed.inject(NAVIGATION_REQUEST_HANDLER);
    expect(typeof handler.handle).toBe('function');
  });
});
