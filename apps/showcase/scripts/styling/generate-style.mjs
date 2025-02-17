import {
  dirname,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  register,
} from '@o3r/style-dictionary';
// eslint-disable-next-line import/namespace, import/default, import/no-named-as-default, import/no-named-as-default-member -- Import of Module type package
import StyleDictionary from 'style-dictionary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getPath = (/** @type {string} */file) => resolve(__dirname, '..', '..', file);

const brands = ['dark-theme', 'horizon-theme'];

const sd = new StyleDictionary({
  usesDtcg: true,
  source: [
    getPath('src/style/design-token.app.json')
  ],
  preprocessors: ['o3r/pre-processor/extensions'],
  parsers: [
    'o3r/json-parser/one-line-token'
  ],
  platforms: {
    css: {
      options: {
        outputReferences: true
      },
      transforms: ['o3r/transform/ratio', 'o3r/transform/unit'],
      transformGroup: 'css'
    }
  },
  log: {
    warnings: 'warn',
    verbosity: 'verbose'
  }
});
register(sd);

void (async () => {
  // generate default theme
  await (await sd.extend({
    source: [
      getPath('src/style/design-token.figma.json')
    ],
    platforms: {
      css: {
        files: [
          {
            destination: getPath('src/style/theme.scss'),
            format: 'o3r/css/variable'
          }
        ]
      },
      metadata: {
        options: {
          outputReferences: true
        },
        transforms: ['o3r/transform/ratio', 'o3r/transform/unit'],
        transformGroup: 'css',
        files: [
          {
            destination: getPath('styling.metadata.json'),
            format: 'o3r/json/metadata'
          }
        ]
      }
    }
  })).buildAllPlatforms();

  // generate additional themes
  await Promise.all(
    brands
      .map((brand) => sd.extend({
        source: [
          getPath(`src/style/${brand}/${brand}.figma.json`)
        ],
        platforms: {
          css: {
            files: [
              {
                destination: getPath(`src/style/${brand}/${brand}.scss`),
                format: 'o3r/css/variable'
              }
            ]
          }
        }
      }))
      .map(async (sd) => (await sd).buildPlatform('css'))
  );
})();
