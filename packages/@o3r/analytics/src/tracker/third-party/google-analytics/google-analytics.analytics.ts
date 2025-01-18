import type {
  AnalyticsThirdPartyService,
} from '../analytics-third-party.interfaces';

type GoogleAnalyticsServiceOptions = {
  uuid: string;
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Create a Google Analytics Service handler
 * @param root0 Options
 * @param root0.uuid UUID of the Google Analytics Account identifying the application
 */
export function createGoogleAnalyticsService({ uuid }: GoogleAnalyticsServiceOptions): AnalyticsThirdPartyService {
  let dataLayer: any[] = [];
  let gtag!: (cmd: string, action: any, data?: any) => void;
  return {
    onRegistration: () => {
      const s = document.createElement('script');
      s.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${uuid}`);
      s.async = true;
      document.head.append(s);

      dataLayer = window.dataLayer || dataLayer;
      // eslint-disable-next-line prefer-arrow/prefer-arrow-functions -- mandatory by Google Analytics script
      gtag = function (...args: any[]) {
        dataLayer.push(args);
      };
      gtag('js', new Date());
      gtag('config', uuid);
    },

    emit: (analyticsReport, options) => {
      const analyticsItem = analyticsReport.report;
      switch (analyticsItem.type) {
        case 'event': {
          switch (analyticsItem.action) {
            case 'click':
            case 'focus': {
              gtag('event', analyticsItem.action, {
                event_category: analyticsItem.category,
                event_label: analyticsItem.label,
                value: analyticsItem.value
              });
              break;
            }

            case 'pageView': {
              gtag('event', 'page_view', {
                page_title: analyticsItem.title,
                page_location: analyticsItem.location
              });
              break;
            }

            case 'exception': {
              gtag('event', 'exception', {
                description: analyticsItem.description,
                fatal: analyticsItem.fatal ?? false
              });
              break;
            }

            default: {
              if (!analyticsItem.action.startsWith('_')) {
                return options?.logger?.warn(`Google Analytics reporter received an event with the action "${analyticsItem.action}" which is not supported`, analyticsItem);
              }

              gtag('event', analyticsItem.action.replace(/^_/, ''), analyticsItem.value);
            }
          }

          break;
        }

        default: {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- `analyticsItem.type` is typed as `never` as this case should not appended
          options?.logger?.warn(`Google Analytics reporter received a message typed "${analyticsItem.type}" which is not supported`, analyticsItem);
        }
      }
    }

  };
}
