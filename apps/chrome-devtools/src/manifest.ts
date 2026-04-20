import {
  defineManifest,
} from '@crxjs/vite-plugin';
import packageData from '../package.json';

export default defineManifest({
  name: packageData.displayName || packageData.name,
  description: packageData.description,
  version: packageData.version.replace(/[A-Za-z-].*$/, ''),
  manifest_version: 3,
  icons: {
    16: 'src/assets/extension/icons/16x16.png',
    32: 'src/assets/extension/icons/32x32.png',
    48: 'src/assets/extension/icons/48x48.png',
    128: 'src/assets/extension/icons/128x128.png'
  },
  background: {
    service_worker: 'src/background/background.ts',
    type: 'module'
  },
  devtools_page: 'src/devtools.html',
  options_ui: {
    page: 'src/options.html',
    open_in_tab: false
  },
  host_permissions: [
    'https://*/*',
    'http://*/*'
  ],
  web_accessible_resources: [
    {
      resources: [
        'src/assets/extension/icons/16x16.png',
        'src/assets/extension/icons/32x32.png',
        'src/assets/extension/icons/48x48.png',
        'src/assets/extension/icons/128x128.png'
      ],
      matches: []
    }
  ],
  permissions: [
    'activeTab',
    'scripting',
    'storage',
    'webNavigation'
  ],
  key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsHrkYizWDjV2LbT/CImu'
    + '6RPKKIbR2EA/mYQlqYe3GxKQA1FaSfkslYn5Rln7B6u7mEuH4shAq4BRJ12qzoeh'
    + '76QDQfjMuUZ9kVyD2fjTEuhUJns92qKo3b+K6AW8V4lfy7uctg8o1VXHDcZ7JxTh'
    + '2iDhqsK87lKpXI1WTvjWn43EWK9Xcz8w17Obzj8Z9E1mOqfn6Uoih4A0o46feDPJ'
    + 'rAXm49VPb51XegCsjeW7EQ1QEHV6kFq4yw/8Oe8J3qRBpNZl97GE4pRceDmgCtcP'
    + 'L8N48lwgatYFCThBw5oCVfkMoYuAp6qAQaKpySuH9/+h+Bv9iRGTkT3iQLrO72qU'
    + 'dQIDAQAB'
});
