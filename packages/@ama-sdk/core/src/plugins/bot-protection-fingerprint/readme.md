## Bot Protection Fingerprint

Plug-in that allows to interact with the fingerprint of the Anti-Bot protection tools as follows:

- Wait for the fingerprint to be present in the document before sending any call
- Forward the fingerprint in a chosen request header with all the calls

This plugin is modular and must be instantiated with the logic that retrieves the fingerprint value, also called {@link BotProtectionFingerprintRetriever}.
This file exports two factories of {@link BotProtectionFingerprintRetriever} to cover our two most common usecases:

- Imperva ABP
- Akamai telemetry

But you can also provide your own logic.

### Type of plugins

- Request plugin: [BotProtectionFingerprintRequest](./bot-protection-fingerprint.request.ts)
