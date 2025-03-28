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
  MFE_HOST_APPLICATION_ID_PARAM,
  MFE_HOST_URL_PARAM,
} from './host-info';
import {
  HostInfoPipe,
} from './host-info.pipe';

describe('HostInfoPipe', () => {
  let pipe: HostInfoPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HostInfoPipe,
        { provide: DomSanitizer, useValue: { sanitize: jest.fn(() => 'sanitizedUrl'), bypassSecurityTrustResourceUrl: jest.fn((url: string) => url) } }
      ]
    });

    pipe = TestBed.inject(HostInfoPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should return undefined if url is undefined', () => {
    expect(pipe.transform(undefined, '')).toBeUndefined();
  });

  it('should not sanitize and return the url computed if it is a string', () => {
    const url = 'http://example.com';
    const result = pipe.transform(url, '');
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    expect(result).toMatch(new RegExp(`^${url}.*`));
  });

  it('should handle SafeResourceUrl input', () => {
    const url = 'http://safe-url/';
    const safeUrl: SafeResourceUrl = { mock: url };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    const result = pipe.transform(safeUrl, '');

    expect(sanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, safeUrl);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(result);
    expect(result).toMatch(new RegExp(`^${url}.*`));
  });

  it('should add query parameters to the URL', () => {
    const url = 'http://example.com';
    const hostUrl = encodeURIComponent('http://localhost');
    const applicationId = 'my-app-id';

    const result = pipe.transform(url, applicationId);

    expect(result).toBe(`${url}/?${MFE_HOST_URL_PARAM}=${hostUrl}&${MFE_HOST_APPLICATION_ID_PARAM}=${applicationId}`);
  });
});
