import {
  TestBed,
} from '@angular/core/testing';
import {
  PlaceholderService,
} from './placeholder.service';

describe('PlaceholderService', () => {
  let service: PlaceholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaceholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
