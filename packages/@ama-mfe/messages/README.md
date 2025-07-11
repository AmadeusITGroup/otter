# Ama mfe messages package

The `@ama-mfe/messages` package exposes a set of message interfaces to help the communication between a host application 
and module applications embedded via iframes.

These interfaces can be used to create messages compatible with the [Amadeus Toolkit for Micro Frontends framework](https://www.npmjs.com/package/@amadeus-it-group/microfrontends-angular).

## Installation
``npm install @ama-mfe/messages``

## Message interfaces
The message interfaces exposed in this package cover common use cases such as:
- [Navigation](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/navigation/): an embedded application requests its host to navigate to a specific URL.
- [Resize](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/resize/): an embedded application's dimension changed and requests its host to adapt the iframe dimension to fit the new content.
- [Theme](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-mfe/ng-utils/src/theme/: a host application requests its embedded module to apply a common css theme. 

Messages are identified thanks to their type property and are versioned for backward compatibility.
