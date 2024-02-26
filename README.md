<h1 align="center">Otter Framework</h1>
<p align="center">
  <img src="./assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

The **Otter** project is a highly modular framework whose goal is to provide a common platform to accelerate and facilitate the development on Angular web applications.
It is split into several units to cover different aspects of these applications (localization, testing, customization, etc.).
Also, to customize an application, metadata can be extracted from the application source code and injected into a CMS to manage dynamic configuration.

> [!TIP]
> The full documentation is available [here](./docs/README.md).

> [!TIP]
> A showcase to help you integrate some simple use cases is available [here](https://amadeusitgroup.github.io/otter/#/home)

## Built With

* [Angular](https://angular.io/)
* [Typescript](https://www.typescriptlang.org/)
* [RxJs](http://reactivex.io/rxjs/)
* [Redux](http://redux.js.org/)
* [Sass](http://sass-lang.com/)
* [Nx](https://nx.dev/)

## Get Started

A new application can be set up with this simple command:

```shell
# Starting a new Otter application
npm create @o3r my-app
```

> [!TIP]
> Please refer to [Otter Get Started](./docs/core/START_NEW_APPLICATION.md) and [Angular Get Started](https://angular.io/guide/setup-local#install-the-angular-cli) for complete documentation.

## Contributing

Please read the [Contributing](./CONTRIBUTING.md) file for details on our code of conduct and the process to submit pull requests.

## Versioning

Please refer to [Security file](./SECURITY.md).

## License

Please refer to the [License file](./LICENSE).

## Acknowledgments

The Otter Team, @AmadeusITGroup/otter_admins, is responsible for the review of the code of this repository.
Any bug of feature request can be addressed via [issue](https://github.com/AmadeusITGroup/otter/issues/new) report.

## Developer

### Building and Testing library

These documents describe how to set up your development environment to build and test the framework.
It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Description](#description)
* [Built With](#built-with)
* [Get Started](#get-started)
* [Contributing](#contributing)
* [Versioning](#versioning)
* [License](#license)
* [Acknowledgments](#acknowledgments)
* [Developer](#developer)
  * [Building and Testing library](#building-and-testing-library)
    * [Prerequisite Software](#prerequisite-software)
    * [Getting the sources](#getting-the-sources)
    * [Installing NPM modules](#installing-npm-modules)
    * [Build command](#build-command)
    * [Running tests locally](#running-tests-locally)
    * [Manage task cache](#manage-task-cache)
    * [Debugging with Visual Studio Code](#debugging-with-visual-studio-code)
    * [Link local packages](#link-local-packages)

Refer to the [contribution guidelines](./CONTRIBUTING.md)
if you'd like to contribute to the framework.

#### Prerequisite Software

Before you can build and test Otter modules, you must install and configure the
following products on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com))
  * [GitHub's Guide to Installing
    Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), (version `>=18.0.0`)
  * This is used to run tests and generate distributable files. We strongly encourage to use an up-to-date LTS version of Node.js to ensure the support of all the Otter packages.
    Each package comes with a minimum Node.js version range defined in the `engine` property of its package.json file.

* [Yarn](https://yarnpkg.com/lang/en/docs/install/), a Node's Package Manager
  * You can install yarn using NPM manager (coming with Node.js).
    The version of Yarn currently used is embedded in the repository and it can be installed using the provided Node.js [corepack](https://yarnpkg.com/getting-started/install).
    In case you need to link this library with your project, you can check the section "Link local packages".

* [Chrome](https://www.google.com/chrome/browser/desktop/index.html)
  * We use Chrome to run our tests.

#### Getting the sources

Clone the Otter repository using the button `Code` or using the following git command:

```shell
git clone https://github.com/AmadeusITGroup/otter.git
```

#### Installing NPM modules

Next, install the JavaScript modules needed to build:

```shell
# Install library project dependencies (package.json)
yarn install
```

#### Build command

To build the modules, run:

```shell
yarn run build
```

Each module can be built independently thanks to [Nx](https://nx.dev/packages/nx/documents/run) commands:

```shell
# ex: Build Core package only
yarn nx build core
```

> [!NOTE]
> Results are put in the `dist` of each module (`packages/@<scope>/<module>/dist`).

#### Running tests locally

Check the formatting:

```shell
yarn run lint
```

Check Unit Tests:

```shell
yarn run test
```

Check Integration Tests:

```shell
yarn run test-int
```

[Verdaccio](./.verdaccio/README.md) is used to run the integration tests as close as possible to a real npm publication.

Each module can be tested independently thanks to [Nx](https://nx.dev/packages/nx/documents/run) commands:

```shell
# ex: Test Core package only
yarn nx test core

# ex: Lint Core package only
yarn nx lint core
```

#### Manage task cache

When running the Build, Lint, or Test commands, **Nx** can use its [cache mechanism](https://nx.dev/concepts/how-caching-works).
In some cases, it may be useful to clear the cache to investigate an issue. This can be done with the following command:

```shell
yarn nx reset
```

#### Debugging with Visual Studio Code

The repository contains the mandatory configuration and the recommended VSCode plugins to ensure optimal comfort and productivity while developing on the Otter Framework.

The default configuration of the repository provides a way to run Unit Tests one by one and to define, within VSCode, break points using the `vscode-jest-tests` debugger task.

#### Link local packages

For Yarn v1, add the `resolutions` property in the main package.json. It should be filled with the relative path to the `dist` of the local packages you want to link. The protocol `link:` can be used.

NOTE: It will not import the transitive dependencies of the linked packages.

Example:

```json
{
  "resolutions": {
    "@o3r/localization": "./relative/path/to/otter/packages/@o3r/localization/dist",
    "@o3r/core": "link:./relative/path/to/otter/packages/@o3r/core/dist",
  }
}
```

For Yarn v2+, the protocol `portal:` can also be used.

NOTE: The portal protocol will also import all the transitive dependencies of the linked packages.
Please keep in mind that mismatched versions of these dependencies may cause some issues.

Example:

```json
{
  "resolutions": {
    "@o3r/localization": "./relative/path/to/otter/library/@o3r/localization/dist",
    "@o3r/core": "link:./relative/path/to/otter/library/@o3r/core/dist",
    "@o3r/rules-engine": "portal:./relative/path/to/otter/library/@o3r/rules-engine/dist",
  }
}
```
