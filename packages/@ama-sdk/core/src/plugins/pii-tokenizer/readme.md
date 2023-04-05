## Personally Identifiable Information Tokenizer

Plugin to replace sensitive parameters from the URL with tokens.
The values corresponding to the tokens are added to the headers of the request as a JWT.
If the key parameter is specified, the generated token will be encrypted.

There are two modes:

- JWT Encoder, which encodes a token with the provided values
- DeepLink, which just appends a provided token to the headers.
    It is used if deepLinkOptions is provided, overriding the JWT Encoder.

> **Note**: the tokenization should be enabled in the ApiClient to use the JWT Encoder mode but it's
not necessary for the DeepLink mode.

### Type of plugins

- Request plugin: [PiiTokenizerRequest](./pii-tokenizer.request.ts)
