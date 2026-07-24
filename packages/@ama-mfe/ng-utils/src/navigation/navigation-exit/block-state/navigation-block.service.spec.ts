import {
  TestBed,
} from '@angular/core/testing';
import {
  NavigationBlockService,
} from './navigation-block.service';

describe('NavigationBlockService', () => {
  let service: NavigationBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NavigationBlockService] });
    service = TestBed.inject(NavigationBlockService);
  });

  it('should start in an unblocked state', () => {
    expect(service.state()).toEqual({ blocked: false });
  });

  it('should move to blocked with the provided reason', () => {
    service.block('unsaved form');
    expect(service.state()).toEqual({ blocked: true, reason: 'unsaved form' });
  });

  it('should allow blocking without a reason', () => {
    service.block();
    expect(service.state()).toEqual({ blocked: true, reason: undefined });
  });

  it('should clear the reason on unblock', () => {
    service.block('dirty');
    service.unblock();
    expect(service.state()).toEqual({ blocked: false });
  });
});
