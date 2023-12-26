# Design tools technical documentation

Otter framework exposes a set of tools to optimize the interactions between the designers and the developers.
The purpose of these tools is to reduce the steps between the design of the solution and the integration to the applications.

## Design Token

The [Design Token specification](https://design-tokens.github.io/community-group/format/) define a dialog format between the design tools (such as [Figma](https://www.figma.com)) and a style language (CSS , Sass, Less, etc...).
The Otter Framework provide a **Builder**, **Schematic** ann **Command Line Interface** to generate CSS Variable and/or Sass Variable, based on the inputted Design Token files.

### Global architecture of the Parser and Renderer

The Design Token code generator tool is technically split in two mains features :

- The **parsers** that will parse and decode the Design Token Specification.
- The **renderers** that will generate the output (mainly code) based on the decoded Design Token Specification.

Both of these features can be customized a different levels. They can be customize thanks to parameter exposes by parsers and renderers **factory functions**, or they be completely re-implemented and injected into the Design Token Code generator.

### Parsers

Currently the [o3r/design](https://github.com/AmadeusITGroup/otter/tree/main/packages/@o3r/design) package provides only a single [parser](https://github.com/AmadeusITGroup/otter/tree/main/packages/@o3r/design/src/core/design-token/parsers).
This parser handle the Design Token Specification as JSON file (or loaded object resulting of a parsing of the JSON file) and result to an object facilitating the tree navigation and the final value calculation to the renderers.

### Renderers

The package is exposing 3 renderers:

- **CSS** Renderer generating CSS Variable according to the specification *(default renderer)*
- **Sass** Renderer generator Sass Variable according to the specification
- **Metadata** renderer that will create the metadata file compatible with the Otter CMS solution.

### Example of Code Generator usage

#### Example: Basic renderer usage

```typescript
import { parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

(async () => {

  /** List of Design Token item parsed */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  // Render the CSS Variable
  await renderDesignTokens(parsedTokenDesign, { logger: console });

})();
```

##### Example: CSS Renderer with Sass Fallback

```typescript
import { getCssTokenDefinitionRenderer, getSassTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

(async () => {

  /** List of Design Token item parsed */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Sass Variable Renderer */
  const sassTokenDefinitionRenderer = getSassTokenDefinitionRenderer();

  /** CSS Variable Renderer */
  const cssTokenDefinitionRenderer = getCssTokenDefinitionRenderer({
    // Specify that the private variable should be rendered in Sass variable
    privateDefinitionRenderer: sassTokenDefinitionRenderer
  });

  // Render the CSS Variable
  await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: cssTokenDefinitionRenderer });

})();
```

##### Example: Implement a Less Renderer

```typescript
import { getCssTokenDefinitionRenderer, getSassTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';

/** Option of the Less variable renderer */
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

  /** List of Design Token item parsed */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Less Variable Renderer */
  const lessTokenDefinitionRenderer = getLessTokenDefinitionRenderer();

  // Render the CSS Variable
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

  /** List of Design Token item parsed */
  const parsedTokenDesign = await parseDesignTokenFile('./path/to/spec.json');

  /** Renderer of the token */
  const tokenValueRenderer = getCustomMetadataTokenValueRenderer();

  /** Metadata Variable Renderer */
  const metadataTokenDefinitionRenderer = getMetadataTokenDefinitionRenderer({ tokenValueRenderer });

  // Render the Metadata file
  await renderDesignTokens(parsedTokenDesign, { tokenDefinitionRenderer: lessTokenDefinitionRenderer });

})();
```
