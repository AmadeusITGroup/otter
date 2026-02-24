import {
  join,
} from 'node:path';
import {
  renderFile,
} from 'ejs';

const templatePath = join(__dirname, 'templates', 'SDK_CONTEXT.md.template');

/**
 * Data required to render the SDK_CONTEXT.md template
 */
export interface SdkContextTemplateData {
  /** The npm package name of the SDK */
  packageName: string;
  /** The OpenAPI specification version (e.g., '3.0.2') */
  openApiVersion: string;
  /** The API title from the OpenAPI spec */
  apiTitle: string;
  /** ASCII tree representation of domain folders */
  domainTree: string;
  /** Markdown content describing each domain and its operations */
  domainsSection: string;
  /** User-provided disambiguation notes, or null for default message */
  disambiguation: string | null;
}

/**
 * Generates the SDK_CONTEXT.md content from template data
 * @param data The template data to populate
 * @returns The generated markdown content
 */
export function renderSdkContextTemplate(data: SdkContextTemplateData): Promise<string> {
  return renderFile(templatePath, data);
}
