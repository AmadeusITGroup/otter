import {
  TestBed,
} from '@angular/core/testing';
import type {
  NavigationBlockConfirmation,
} from './navigation-block-confirmation.interface';
import {
  NAVIGATION_BLOCK_CONFIRMATION,
} from './navigation-block-confirmation.interface';
import {
  NavigationBlockConfirmationService,
} from './navigation-block-confirmation.service';

describe('NavigationBlockConfirmationService', () => {
  let mockStrategy: jest.Mocked<NavigationBlockConfirmation>;
  let service: NavigationBlockConfirmationService;

  beforeEach(() => {
    mockStrategy = {
      confirm: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: NAVIGATION_BLOCK_CONFIRMATION, useValue: mockStrategy },
        NavigationBlockConfirmationService
      ]
    });
    service = TestBed.inject(NavigationBlockConfirmationService);
  });

  it('should delegate to the injected strategy', async () => {
    mockStrategy.confirm.mockResolvedValue(true);
    const result = await service.confirm('dirty');
    expect(mockStrategy.confirm).toHaveBeenCalledWith('dirty');
    expect(result).toBe(true);
  });

  it('should return false when strategy resolves false', async () => {
    mockStrategy.confirm.mockResolvedValue(false);
    const result = await service.confirm();
    expect(result).toBe(false);
  });

  it('should deduplicate concurrent calls', async () => {
    let resolveStrategy: (value: boolean) => void;
    mockStrategy.confirm.mockReturnValue(
      new Promise((resolve) => {
        resolveStrategy = resolve;
      })
    );

    // Start two concurrent confirmations
    const promise1 = service.confirm('reason1');
    const promise2 = service.confirm('reason2');

    // Strategy should only be called once (first call wins)
    expect(mockStrategy.confirm).toHaveBeenCalledTimes(1);
    expect(mockStrategy.confirm).toHaveBeenCalledWith('reason1');

    // Both promises should resolve to the same result
    resolveStrategy(true);
    await expect(promise1).resolves.toBe(true);
    await expect(promise2).resolves.toBe(true);
  });

  it('should allow new calls after previous call completes', async () => {
    mockStrategy.confirm.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const result1 = await service.confirm('first');
    expect(result1).toBe(true);

    const result2 = await service.confirm('second');
    expect(result2).toBe(false);

    expect(mockStrategy.confirm).toHaveBeenCalledTimes(2);
  });
});
