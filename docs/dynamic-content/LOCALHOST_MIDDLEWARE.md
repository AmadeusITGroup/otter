# Localhost middleware
## About
The Angular dev server does not offer a way to intercept requests and responses. There are some use cases when this is needed (i.e. inject query or POST parameters into the HTML page).

## Usage

In order to permit this, the dev server used for serving local resources can be replaced with a `custom-webpack:dev-server`.

[`package.json`]
```json
...
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    ...
  },
  "localbuild": {
    "builder": "@angular-builders/custom-webpack:browser",
    "options": {            
      "customWebpackConfig": {
        "path": "./extra-webpack.config.ts"
      },
      ...(same as for builder)
    },
    ...
  },
  "serve": {
    "builder": "@angular-builders/custom-webpack:dev-server",
    "options": {
      "customWebpackConfig": {
        "path": "./extra-webpack.config.ts"
      },
      "browserTarget": "<project-name>:localbuild",
      "port": 3030
    },
    "configurations": {
      "production": {
        "browserTarget": "<project-name>:build:production"
      }
    }
  },
  ...
```

[`extra-webpack.config.ts`]
```typescript
import {setup} from '@o3r/dynamic-content/middlewares';

module.exports = (config: any) => {
  config.devServer.before = (app: {[x: string]: any}) => setup(app);
  return config;
};
```

