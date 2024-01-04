# Design tools technical documentation

The Otter framework exposes a set of tools to optimize the interactions between graphic designers and developers.
The purpose of these tools is to reduce the steps between the design of the solution and its integration into the application via the use of Design Tokens.

## Design Token

The [Design Token specification](https://design-tokens.github.io/community-group/format/) defines an interface between design tools (such as [Figma](https://www.figma.com)) and a style language (CSS , Sass, Less, etc...).
The Otter Framework can help you translate a Design Token file into CSS and/or Sass variables thanks to the provided **Builders**, **Schematics** and **Command Line Interfaces**.

### Global architecture of the Parser and Renderer

The Design Token code generator tool is split into two main technical features:

- The **parsers** that will parse and decode the Design Token specification.
- The **renderers** that will generate the output (mainly code) based on the decoded Design Token specification.

Both of these features can be customized at different levels. They can be customized thanks to parameters exposed by parsers and renderers **factory functions**, or they can be completely re-implemented and injected into the Design Token Code generator.

### Parsers

Currently the [o3r/design](https://github.com/AmadeusITGroup/otter/tree/main/packages/@o3r/design) package provides only a single [parser](https://github.com/AmadeusITGroup/otter/tree/main/packages/@o3r/design/src/core/design-token/parsers).
This parser handles Design Token specifications (as a JSON file or a loaded object resulting from the parsing of a JSON file) to generate an object facilitating the tree navigation and the value computed by the renderers.

### Renderers

The package exposes 3 renderers:

- **CSS** renderer generating CSS variables according to the specification *(default renderer)*
- **Sass** renderer generating Sass variables according to the specification
- **Metadata** renderer creating the [style metadata](https://github.com/AmadeusITGroup/otter/tree/main/packages/@o3r/styling/schemas/style.metadata.schema.json) file compatible with the Otter CMS solution

### Example of Code Generator usage

#### Example: Basic renderer usage

```typescript
import { parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

(async () => {

  /** List of parsed Design Token items*/
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  // Render the CSS variables
  await renderDesignTokens(parsedTokenDesign, { logger: console });

})();
```

##### Example: CSS renderer with Sass fallback

```typescript
import { getCssTokenDefinitionRenderer, getSassTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

(async () => {

  /** List of parsed Design Token items */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Sass variable renderer */
  const sassTokenDefinitionRenderer = getSassTokenDefinitionRenderer();

  /** CSS variable renderer */
  const cssTokenDefinitionRenderer = getCssTokenDefinitionRenderer({
    // Specify that the private variable should be rendered in Sass variable
    privateDefinitionRenderer: sassTokenDefinitionRenderer
  });

  // Render the CSS variables
  await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: cssTokenDefinitionRenderer });

})();
```

##### Example: Implement a Less renderer

```typescript
import { getCssTokenDefinitionRenderer, getSassTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

/** Options of the Less variable renderer */
interface LessTokenDefinitionRendererOptions {
  isPrivateVariable?: (variable: DesignTokenVariableStructure) => boolean;
  tokenValueRenderer?: TokenValueRenderer;
}

/** Less variable render */
const getLessTokenDefinitionRenderer = (options?: LessTokenDefinitionRendererOptions): TokenDefinitionRenderer => {
  const tokenValueRenderer = options?.tokenValueRenderer || getCssTokenValueRenderer();
  const isPrivateVariable = options?.isPrivateVariable || isO3rPrivateVariable;

  const renderer = (variable: DesignTokenVariableStructure, variableSet: Map<string, DesignTokenVariableStructure>) => {
    return `@${isPrivateVariable(variable) ? '_' : ''}${variable.getKey()}: ${ tokenValueRenderer(variable, variableSet) };`;
  };
  return renderer;
};

(async () => {

  /** List of parsed Design Token items */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Less variable renderer */
  const lessTokenDefinitionRenderer = getLessTokenDefinitionRenderer();

  // Render the CSS variables
  await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: lessTokenDefinitionRenderer });

})();
```

##### Example: Customize metadata renderer

```typescript
import { getMetadataTokenValueRenderer, getMetadataTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

const getCustomMetadataTokenValueRenderer = (options?: MetadataTokenValueRendererOptions): TokenValueRenderer => {
  const defaultMetadataRender = getMetadataTokenValueRenderer(options);
  return  (variable, variableSet) => {
    const defaultMetadataObj = JSON.parse(defaultMetadataRender(variable, variableSet));
    // Add custom field
    defaultMetadataObj.myField = 'custom value';
    return JSON.stringify(defaultMetadataObj);
  };
};

(async () => {

  /** List of parsed Design Token items */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Renderer of the token */
  const tokenValueRenderer = getCustomMetadataTokenValueRenderer();

  /** Metadata variable renderer */
  const metadataTokenDefinitionRenderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer });

  // Render the Metadata file
  await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: lessTokenDefinitionRenderer });

})();
```
