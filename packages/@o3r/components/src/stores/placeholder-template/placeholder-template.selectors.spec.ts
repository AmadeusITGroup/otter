import * as selectors from './placeholder-template.selectors';
import {PlaceholderTemplateState} from './placeholder-template.state';
import {PlaceholderRequestState} from '@o3r/components';

let placeholderRequestState: PlaceholderRequestState;
let placeholderTemplateState: PlaceholderTemplateState;

describe('selectPlaceholderRenderedTemplates', () => {
  beforeEach(()=>{
    placeholderTemplateState = {
      ids: [
        'pl2358lv-2c63-42e1-b450-6aafd91fbae8'
      ],
      entities: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'pl2358lv-2c63-42e1-b450-6aafd91fbae8': {
          id: 'pl2358lv-2c63-42e1-b450-6aafd91fbae8',
          urlsWithPriority: [
            {
              rawUrl: 'assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json',
              priority: 1
            },
            {
              rawUrl: 'assets/placeholders/searchPlaceholder.json',
              priority: 10
            }
          ]
        }
      }
    };
    placeholderRequestState = {
      requestIds: [],
      ids: ['assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json', 'assets/placeholders/searchPlaceholder.json'],
      entities: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json': {
          id: 'assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json',
          resolvedUrl: 'assets/placeholders/en-GB/searchSecondPlaceholder.json',
          used: true,
          requestIds: [],
          isFailure: false,
          isPending: false,
          vars: {
            myRelPath: {
              type: 'relativeUrl',
              value: 'assets-demo-app/img/logo/logo-positive.png'
            },
            pageUrl: {
              type: 'fact',
              value: 'pageUrl'
            }
          },
          template: '<div>Placeholder from application pageUrl=<%= pageUrl %></div><img src="<%= myRelPath %>">',
          renderedTemplate: '<div>Placeholder from application pageUrl=/search</div><img src="assets/assets-demo-app/img/logo/logo-positive.png">',
          unknownTypeFound: false
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'assets/placeholders/searchPlaceholder.json': {
          id: 'assets/placeholders/searchPlaceholder.json',
          resolvedUrl: 'assets/placeholders/searchPlaceholder.json',
          used: true,
          requestIds: [],
          isFailure: false,
          isPending: false,
          vars: {
            myRelPath: {
              type: 'relativeUrl',
              value: 'assets-demo-app/img/logo/logo-positive.png'
            },
            pageUrl: {
              type: 'fact',
              value: 'pageUrl'
            }
          },
          template: '<div>Placeholder from the library, only default language pageUrl=<%= pageUrl %></div><img src="<%= myRelPath %>">',
          renderedTemplate: '<div>Placeholder from the library, only default language pageUrl=/search</div><img src="assets/assets-demo-app/img/logo/logo-positive.png">',
          unknownTypeFound: false
        }
      }
    };
  });
  it('should handle undefined state properly', () => {
    expect(selectors.selectPlaceholderRenderedTemplates('fakeId')({
      placeholderRequest: undefined,
      placeholderTemplate: undefined
    })).toBeUndefined();
    expect(selectors.selectPlaceholderRenderedTemplates('fakeId')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: undefined
    })).toBeUndefined();
    expect(selectors.selectPlaceholderRenderedTemplates('fakeId')({
      placeholderRequest: undefined,
      placeholderTemplate: placeholderTemplateState
    })).toBeUndefined();
    expect(selectors.selectPlaceholderRenderedTemplates('fakeId')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: placeholderTemplateState
    })).toBeUndefined();
  });

  it('should handle pending status properly', () => {
    placeholderRequestState.entities['assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json'].isPending = true;
    expect(selectors.selectPlaceholderRenderedTemplates('pl2358lv-2c63-42e1-b450-6aafd91fbae8')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: placeholderTemplateState
    })).toStrictEqual({orderedRenderedTemplates: undefined, isPending: true});
  });

  it('should filter items on failure out', () => {
    placeholderRequestState.entities['assets/placeholders/[LANGUAGE]/searchSecondPlaceholder.json'].isFailure = true;
    expect(selectors.selectPlaceholderRenderedTemplates('pl2358lv-2c63-42e1-b450-6aafd91fbae8')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: placeholderTemplateState
    })?.orderedRenderedTemplates?.length).toBe(1);
    placeholderRequestState.entities['assets/placeholders/searchPlaceholder.json'].isFailure = true;
    expect(selectors.selectPlaceholderRenderedTemplates('pl2358lv-2c63-42e1-b450-6aafd91fbae8')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: placeholderTemplateState
    })?.orderedRenderedTemplates?.length).toBe(0);
  });

  it('should return the list of sorted placeholders', () => {
    const results = selectors.selectPlaceholderRenderedTemplates('pl2358lv-2c63-42e1-b450-6aafd91fbae8')({
      placeholderRequest: placeholderRequestState,
      placeholderTemplate: placeholderTemplateState
    });
    expect(results?.isPending).toBeFalsy();
    expect(results?.orderedRenderedTemplates[0]).toContain('Placeholder from the library');
    expect(results?.orderedRenderedTemplates[1]).toContain('Placeholder from application');
  });
});
