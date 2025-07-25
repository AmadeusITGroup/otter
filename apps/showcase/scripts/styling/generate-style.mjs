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
} from '@o3r/style-dictionary';
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
      transforms: ['o3r/transform/ratio', 'o3r/transform/unit'],
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
            'run-app-locally.tertiary-bg': 'src/app/run-app-locally/run-app-locally.style.vars.scss'
          }, { format: 'o3r/css/variable' }),
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
