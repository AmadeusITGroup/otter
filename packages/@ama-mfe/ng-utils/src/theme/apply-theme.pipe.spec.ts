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
  ApplyTheme,
} from './apply-theme.pipe';
import {
  ThemeProducerService,
} from './theme.producer.service';

describe('ApplyTheme', () => {
  let pipe: ApplyTheme;
  let sanitizer: DomSanitizer;
  let themeService: ThemeProducerService;

  beforeEach(() => {
    const themeServiceMock = {
      currentTheme: jest.fn(() => ({ name: 'dark' }))
    };
    TestBed.configureTestingModule({
      providers: [
        ApplyTheme,
        { provide: DomSanitizer, useValue: { sanitize: jest.fn(() => 'sanitizedUrl'), bypassSecurityTrustResourceUrl: jest.fn((url: string) => url) } },
        { provide: ThemeProducerService, useValue: themeServiceMock }
      ]
    });

    pipe = TestBed.inject(ApplyTheme);
    sanitizer = TestBed.inject(DomSanitizer);
    themeService = TestBed.inject(ThemeProducerService);
  });

  it('should return undefined if url is undefined', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('should append the current theme to the given url', () => {
    const url = 'http://example.com';
    const result = pipe.transform(url);
    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    expect(result).toBe('http://example.com/?theme=dark');
  });

  it('should handle SafeResourceUrl input and append theme', () => {
    const url = 'http://safe-url/';
    const safeUrl: SafeResourceUrl = { mock: url };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(url);

    const result = pipe.transform(safeUrl);

    expect(sanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, safeUrl);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('http://safe-url/?theme=dark');
    expect(result).toBe('http://safe-url/?theme=dark');
  });

  it('should return undefined if url string is not a valid url', () => {
    const url = 'stringUrl';
    const safeUrl: SafeResourceUrl = { mock: url };
    jest.spyOn(sanitizer, 'sanitize').mockReturnValue(null);
    const result = pipe.transform(safeUrl);
    expect(result).toBe(undefined);
  });

  it('should not append theme to the url if currentTheme is undefined', () => {
    jest.spyOn(themeService, 'currentTheme').mockImplementation(() => undefined);
    const url = 'http://example.com';
    const result = pipe.transform(url);
    expect(result).toBe('http://example.com/');
  });
});
