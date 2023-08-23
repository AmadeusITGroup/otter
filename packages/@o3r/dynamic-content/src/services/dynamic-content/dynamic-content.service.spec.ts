import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { firstValueFrom } from 'rxjs';
import { DynamicContentModule } from './dynamic-content.module';
import { DynamicContentService } from './dynamic-content.service';
import {CMS_ASSETS_PATH_TOKEN, DYNAMIC_CONTENT_BASE_PATH_TOKEN, MEDIA_FOLDER_NAME_TOKEN} from './dynamic-content.token';


let service: DynamicContentService;

describe('DynamicContentService', () => {
  beforeAll(() => getTestBed().platform || TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
  }));

  describe('with a content base path not ending in /', () => {
    beforeEach(async () => {
      try {
        delete document.body.dataset.cmsassetspath;
      } catch {
      }
      await TestBed.configureTestingModule({
        providers: [
          DynamicContentService,
          {provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN, useValue: 'dynamic-base-path'},
          {provide: CMS_ASSETS_PATH_TOKEN, useValue: 'assets-path'},
          {provide: MEDIA_FOLDER_NAME_TOKEN, useValue: 'assets'}
        ]
      }).compileComponents();

      service = TestBed.inject(DynamicContentService);
    });

    it('should get the correct path when assets start with /', () => {
      return expect(firstValueFrom(
        service.getContentPathStream('/asset.png')
      )).resolves.toBe('dynamic-base-path/asset.png');
    });

    it('should get the correct path when assets does not start with /', () => {
      return expect(firstValueFrom(
        service.getContentPathStream('asset.png')
      )).resolves.toBe('dynamic-base-path/asset.png');
    });

    it('should return a non-empty base path when calling getDynamicContentBasePath', () => {
      expect(service.basePath).toBe('dynamic-base-path');
    });
  });

  describe('with a content base path ending in /', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          DynamicContentService,
          {provide: DYNAMIC_CONTENT_BASE_PATH_TOKEN, useValue: 'dynamic-base-path/'},
          {provide: CMS_ASSETS_PATH_TOKEN, useValue: 'assets-path'},
          {provide: MEDIA_FOLDER_NAME_TOKEN, useValue: 'assets'}
        ]
      }).compileComponents();
      service = TestBed.inject(DynamicContentService);
    });

    it('should get the correct path when assets start with /', () => {
      return expect(firstValueFrom(
        service.getContentPathStream('/asset.png')
      )).resolves.toBe('dynamic-base-path/asset.png');
    });

    it('should get the correct path when assets does not start with /', () => {
      return expect(firstValueFrom(
        service.getContentPathStream('asset.png')
      )).resolves.toBe('dynamic-base-path/asset.png');
    });

  });

  describe('regarding the module forRoot', () => {
    describe('with the default configuration', () => {
      describe('with a tag data-dynamiccontentpath in the body', () => {
        beforeEach(async () => {
          document.body.dataset.dynamiccontentpath = 'my-default-content-path/';
          try {
            delete document.body.dataset.cmsassetspath;
          } catch {
          }

          await TestBed.configureTestingModule({
            imports: [DynamicContentModule]
          }).compileComponents();

          service = TestBed.inject(DynamicContentService);
        });

        it('should get the base path from document.body.dataset.dynamicontentpath', () => {
          return expect(firstValueFrom(
            service.getContentPathStream('/asset.png')
          )).resolves.toBe('my-default-content-path/asset.png');
        });
      });

      describe('without a tag data-dynamiccontentpath in the body', () => {
        beforeEach(() => {
          try {
            delete document.body.dataset.dynamiccontentpath;
            delete document.body.dataset.cmsassetspath;
          } catch {
          }
        });

        beforeEach(async () => {
          await TestBed.configureTestingModule({
            imports: [DynamicContentModule]
          }).compileComponents();

          service = TestBed.inject(DynamicContentService);
        });

        it('should default base path to empty string', () => {
          return expect(firstValueFrom(
            service.getContentPathStream('/asset.png')
          )).resolves.toBe('/asset.png');
        });

        it('should not prepend a slash if base path is empty', () => {
          return expect(firstValueFrom(
            service.getContentPathStream('asset.png')
          )).resolves.toBe('asset.png');
        });

        it('should return an empty base path when calling getDynamicContentBasePath', () => {
          expect(service.basePath).toBe('');
        });
      });

    });

    describe('with the custom configuration', () => {
      beforeEach(async () => {
        document.body.dataset.dynamiccontentpath = 'my-default-content-path';
        try {
          delete document.body.dataset.cmsassetspath;
        } catch {
        }

        await TestBed.configureTestingModule({
          imports: [DynamicContentModule.forRoot({ content: 'my-custom-path'})]
        }).compileComponents();

        service = TestBed.inject(DynamicContentService);
      });

      it('should get the base path from the custom config', () => {
        return expect(firstValueFrom(
          service.getContentPathStream('/asset.png')
        )).resolves.toBe('my-custom-path/asset.png');
      });

      it('should get the path from the custom config for both path and assets folder', () => {
        return expect(firstValueFrom(
          service.getMediaPathStream('/asset.png')
        )).resolves.toBe('my-custom-path/assets/asset.png');
      });
    });

    describe('with the custom configuration for content as object', () => {
      beforeEach(async () => {
        document.body.dataset.dynamiccontentpath = 'my-default-content-path';
        try {
          delete document.body.dataset.cmsassetspath;
        } catch {
        }

        await TestBed.configureTestingModule({
          imports: [DynamicContentModule.forRoot({content: 'my-custom-path'})]
        }).compileComponents();

        service = TestBed.inject(DynamicContentService);
      });

      it('should get the base path from the custom config', () => {
        return expect(firstValueFrom(
          service.getContentPathStream('/asset.png')
        )).resolves.toBe('my-custom-path/asset.png');
      });

      it('should get the path from the custom config for both path and assets folder', () => {
        return expect(firstValueFrom(
          service.getMediaPathStream('/asset.png')
        )).resolves.toBe('my-custom-path/assets/asset.png');
      });
    });

    describe('with the custom configuration for cms assets', () => {
      beforeEach(async () => {
        document.body.dataset.dynamiccontentpath = 'my-default-content-path';
        document.body.dataset.cmsassetspath = 'my-custom-cms-assets-location';

        await TestBed.configureTestingModule({
          imports: [DynamicContentModule.forRoot({cmsAssets: 'cms-assets-location'})]
        }).compileComponents();

        service = TestBed.inject(DynamicContentService);
      });

      it('should not touch the content path', () => {
        return expect(firstValueFrom(
          service.getContentPathStream('/asset.png')
        )).resolves.toBe('my-default-content-path/asset.png');
      });

      it('should get the assets path from the custom config', () => {
        return expect(firstValueFrom(
          service.getMediaPathStream('asset.png')
        )).resolves.toBe('cms-assets-location/asset.png');
      });

      it('should return the assets path if it is starting with / and cms assets token is provided', () => {
        return expect(firstValueFrom(
          service.getMediaPathStream('/asset.png')
        )).resolves.toBe('/asset.png');
      });
    });

  });

  describe('with a tag data-cmsassetspath in the body', () => {
    beforeEach(async () => {
      document.body.dataset.dynamiccontentpath = 'my-default-content-path/';
      document.body.dataset.cmsassetspath = 'cms-assets-path/';

      await TestBed.configureTestingModule({
        imports: [DynamicContentModule]
      }).compileComponents();

      service = TestBed.inject(DynamicContentService);
    });

    it('should take priority over dynamicontentpath only for media path', async () => {
      await expect(firstValueFrom(
        service.getMediaPathStream('asset.png')
      )).resolves.toBe('cms-assets-path/asset.png');

      return expect(firstValueFrom(
        service.getContentPathStream('asset.png')
      )).resolves.toBe('my-default-content-path/asset.png');
    });

    it('should return the assets path if it is starting with / and cms assets token is provided', () => {
      return expect(firstValueFrom(service.getMediaPathStream('/asset.png'))).resolves.toBe('/asset.png');
    });
  });

  describe('with a media folder name provided via MEDIA_FOLDER_NAME_TOKEN', () => {
    beforeEach(async () => {
      document.body.dataset.dynamiccontentpath = 'my-default-content-path';
      try {
        delete document.body.dataset.cmsassetspath;
      } catch {
      }

      await TestBed.configureTestingModule({
        imports: [DynamicContentModule],
        providers: [{
          provide: MEDIA_FOLDER_NAME_TOKEN,
          useValue: 'mediaFolderName'
        }]
      }).compileComponents();

      service = TestBed.inject(DynamicContentService);
    });

    it('should not change anything from the content path', () => {
      return expect(firstValueFrom(
        service.getContentPathStream('/asset.png')
      )).resolves.toBe('my-default-content-path/asset.png');
    });

    it('should be included in the media path', () => {
      return expect(firstValueFrom(
        service.getMediaPathStream('/asset.png')
      )).resolves.toBe('my-default-content-path/mediaFolderName/asset.png');
    });
  });
});
