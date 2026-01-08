import {
  dirname,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';
import {
  baseConfig,
  getTargetFiles,
  register,
} from '@ama-styling/style-dictionary';
import StyleDictionary from 'style-dictionary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getPath = (/** @type {string} */file) => resolve(__dirname, '..', '..', file);

const brands = ['dark-theme', 'horizon-theme'];

const sd = new StyleDictionary({
  usesDtcg: true,
  ...baseConfig,
  platforms: {
    css: {
      options: {
        outputReferences: true
      },
      transforms: ['ama/transform/ratio', 'ama/transform/unit'],
      transformGroup: 'css'
    }
  },
  log: {
    warnings: 'warn',
    verbosity: 'default'
  }
});
register(sd);

void (async () => {
  // generate default theme
  await (await sd.extend({
    source: [
      getPath('src/style/design-token.app.json'),
      getPath('src/style/design-token.figma.json')
    ],
    platforms: {
      css: {
        log: {
          warnings: 'disabled'
        },
        files: [
          ...getTargetFiles({
            'run-app-locally.tertiary-bg': 'src/app/run-app-locally/run-app-locally-style-vars.scss'
          }, { format: 'ama/css/variable' }),
          {
            destination: getPath('src/style/theme.scss'),
            format: 'ama/css/variable'
          }
        ]
      },
      metadata: {
        options: {
          outputReferences: true
        },
        transforms: ['ama/transform/ratio', 'ama/transform/unit'],
        transformGroup: 'css',
        files: [
          {
            destination: getPath('styling.metadata.json'),
            format: 'ama/json/metadata'
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
                format: 'ama/css/variable'
              }
            ]
          }
        }
      }))
      .map(async (sd) => (await sd).buildPlatform('css'))
  );
})();
