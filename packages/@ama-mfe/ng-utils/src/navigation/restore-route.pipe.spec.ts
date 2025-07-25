import {
  SecurityContext,
} from '@angular/core';
import {
  TestBed,
} from '@angular/core/testing';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  ActivatedRoute,
} from '@angular/router';
import {
  RestoreRoute,
  RestoreRouteOptions,
} from './restore-route.pipe';
import {
  RouteMemorizeService,
} from './route-memorize/route-memorize.service';

describe('RestoreRoute', () => {
  let pipe: RestoreRoute;
  let sanitizer: DomSanitizer;
  let routeMemorizeService: RouteMemorizeService;
  let activatedRoute: ActivatedRoute;

  beforeEach(() => {
    const routeMemorizeServiceMock = {
      getRoute: jest.fn(),
      memorizeRoute: jest.fn(() => {})
    };
    TestBed.configureTestingModule({
      providers: [
        RestoreRoute,
        { provide: DomSanitizer, useValue: { sanitize: jest.fn(() => 'sanitizedUrl'), bypassSecurityTrustResourceUrl: jest.fn((url: string) => url) } },
        { provide: ActivatedRoute, useValue: { routeConfig: { path: 'test-path' } } },
        { provide: RouteMemorizeService, useValue: routeMemorizeServiceMock }
      ]
    });

    pipe = TestBed.inject(RestoreRoute);
    sanitizer = TestBed.inject(DomSanitizer);
    routeMemorizeService = TestBed.inject(RouteMemorizeService);
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should return undefined if url is undefined', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('should not sanitize and return the url computed if it is a string', () => {
    const url = 'http://example.com';
    const result = pipe.transform(url);
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    expect(result).toBe(`${url}/`);
  });

  it('should handle SafeResourceUrl input', () => {
    const url = 'http://safe-url/';
    const safeUrl: SafeResourceUrl = { mock: url };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    const result = pipe.transform(safeUrl);

    expect(sanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, safeUrl);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url);
    expect(result).toBe(url);
  });

  it('should propagate query params if propagateQueryParams is true', () => {
    const url = 'http://example.com';
    const options: RestoreRouteOptions = { propagateQueryParams: true };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    Object.defineProperty(window, 'location', {
      value: { href: 'http://example-top-window.com?param2=value2' },
      writable: true
    });

    const result = pipe.transform(url, options);

    expect(result).toBe('http://example.com/?param2=value2');
  });

  it('should propagate and concatenate query params if propagateQueryParams is true', () => {
    const url = 'http://example.com?param1=value1';
    const options: RestoreRouteOptions = { propagateQueryParams: true };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    Object.defineProperty(window, 'location', {
      value: { href: 'http://example-top-window.com?param2=value2' },
      writable: true
    });

    const result = pipe.transform(url, options);

    expect(result).toBe('http://example.com/?param1=value1&param2=value2');
  });

  it('should override query params if overrideQueryParams and propagateQueryParams is true', () => {
    const url = 'http://example.com?param1=value1';
    const options: RestoreRouteOptions = { propagateQueryParams: true, overrideQueryParams: true };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);
    Object.defineProperty(window, 'location', {
      value: { href: 'http://example-to-window.com?param1=value2' },
      writable: true
    });

    const result = pipe.transform(url, options);

    expect(result).toBe('http://example.com/?param1=value2');
  });

  it('should append the correct pathname and remove the module path from top window url', () => {
    const url = 'http://example.com';
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);
    Object.defineProperty(window, 'location', {
      value: { href: 'http://example-top-window.com/module-path/in-module-path' },
      writable: true
    });
    jest.replaceProperty(activatedRoute, 'routeConfig', { path: 'module-path' });

    const result = pipe.transform(url);

    expect(result).toBe('http://example.com/in-module-path');
  });

  it('should handle memorized route', () => {
    const url = 'http://example.com';
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    Object.defineProperty(window, 'origin', {
      value: 'http://example-top-window.com'
    });

    const options: RestoreRouteOptions = { memoryChannelId: 'test', propagateQueryParams: true };
    jest.spyOn(routeMemorizeService, 'getRoute').mockReturnValue('module-path/path-inside-module?param1=value1');
    jest.replaceProperty(activatedRoute, 'routeConfig', { path: 'module-path' });
    const result = pipe.transform(url, options);

    expect(result).toBe('http://example.com/path-inside-module?param1=value1');
  });
});
