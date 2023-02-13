# Releasing process

## Monthly releases

A minor version is released every month.

Two major versions are released per year:

- A technical version is released during summer to upgrade the Otter library peer dependencies, such as:
  - Angular
  - Typescript
  - RxJS
  - NgRx
  - etc...

- Another one to deliver new features of the Otter library, released at the beginning of the year.

## Release version support

The team will provide support on the latest minor version of major versions __N (current)__, __N-1__ and __N-2__.

A major version will be supported as long as it relies on a [non deprecated version of Angular](https://angular.io/guide/releases#support-policy-and-schedule).

> **Note**: It is also important to note that Otter supports the same browser versions as Angular.

The following table provides the status of the Otter versions under support and each of their corresponding Angular version:

| Otter version | Angular version | Support ends |
|---------------|-----------------|--------------|
| ~8.0.0        | ^15.0.0         | 2024-05-18   |
| ^7.6.0        | ^14.0.0         | 2023-11-18   |
| ^6.3.0        | ^13.0.0         | 2023-05-04   |


## Reporting a Vulnerability

All bugs can be reported via the [Github Issue](https://github.com/AmadeusITGroup/otter/issues) session.
