import {
  readFile,
} from 'node:fs/promises';
import {
  z,
} from 'zod';

// TODO: extract CssMetadata and CssVariable into a lightweight @ama-styling/core package
// (plain .ts, no deps) to avoid duplication across @ama-styling/style-dictionary (.mts),
// @ama-styling/devkit, and this package

/**
 * Represents a CSS variable design token
 */
export interface CssVariable {
  /** CSS custom property name */
  name: string;
  /** Default value for the variable */
  defaultValue: string;
  /** Other tokens this variable references */
  references?: CssVariable[];
  /** Categorization tags */
  tags?: string[];
  /** Human-readable description */
  description?: string;
  /** Display label */
  label?: string;
  /** Value type */
  type?: 'string' | 'color';
  /** Token category */
  category?: string;
  /** Component association */
  component?: { library: string; name: string };
}

/**
 * Metadata structure for CSS design tokens
 */
export interface CssMetadata {
  /** Map of variable name to variable definition */
  variables: Record<string, CssVariable>;
}

const cssVariableSchema: z.ZodType<CssVariable> = z.object({
  name: z.string(),
  defaultValue: z.string(),
  references: z.lazy(() => z.array(cssVariableSchema)).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  type: z.enum(['string', 'color']).optional(),
  category: z.string().optional(),
  component: z.object({
    library: z.string(),
    name: z.string()
  }).optional()
});

const cssMetadataSchema = z.object({
  variables: z.record(z.string(), cssVariableSchema)
});

/**
 * Load and validate a styling metadata JSON file.
 * @param filePath Path to the styling.metadata.json file
 * @returns Parsed and validated CSS metadata
 */
export async function loadMetadata(filePath: string): Promise<CssMetadata> {
  let content: string;
  try {
    content = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read metadata file at "${filePath}": ${message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse metadata file at "${filePath}": invalid JSON`);
  }

  const result = cssMetadataSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid metadata shape in "${filePath}": ${result.error.message}`);
  }

  return result.data;
}
