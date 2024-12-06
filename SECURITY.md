# Releasing process

## Monthly releases

A minor version is released every month.

Two major versions are released per year:

- A technical version is released during summer which can include:
  - Upgrades of the Otter library peer dependencies, such as:
    - Angular
    - Typescript
    - RxJS
    - NgRx
    - etc...
  - Breaking changes covered by `ng update` code patching
  - Breaking changes with a **very low migration cost** can be exceptionally accepted, the code review will determine its acceptance.

- Another one to deliver new features of the Otter library, released at the beginning of the year.

## Release version support

The "support" of a released version includes the following aspects:

- Handling bug fixes when requested via the [Github Issue page](https://github.com/AmadeusITGroup/otter/issues).
- Reviewing contributions to bugfix pull requests (and handling their merging).
- Cascading bugfixes when they are implemented in an inferior released version.
- Handling bugfix cherry-picking on a specific version demand.

> [!WARNING]
> Only **bugfixes** are accepted on supported versions. New features are allowed exclusively on the `main` (latest *prerelease* version) and the `next` branches.
> Note that **breaking changes** should always target a `next` branch.

The team will support the latest minor version of major versions **N (current)**, **N-1** and **N-2**.\
All the minor versions of the major **N (current)** are also supported until a new major version is created.
The major version becoming **N-3** will also be flagged as unsupported.

A major version will be supported as long as it relies on a [non-deprecated version of Angular](https://angular.io/guide/releases#support-policy-and-schedule) and is included in the previously listed major versions.

> [!NOTE]
> It is also important to note that Otter supports the same browser versions as Angular.

The following table provides the status of the Otter versions under support and each of their corresponding Angular version:

| Otter version | Angular version | Support ends |
| :-----------: | :-------------: | :----------: |
|      11       |       18        |  2026-11-20  |
|      10       |       17        |  2025-05-15  |
|       9       |       16        |  2024-11-08  |

## Reporting a Vulnerability

All bugs can be reported via the [Github Issue](https://github.com/AmadeusITGroup/otter/issues) session.
