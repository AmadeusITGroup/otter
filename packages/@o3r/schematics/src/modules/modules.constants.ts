import type { PackageJson } from 'type-fest';

/** Package as return by the NPM Registry */
export type NpmRegistryPackage = Pick<PackageJson, 'name' | 'description' | 'version' | 'keywords'> &
{
  /** Package name */
  name: string;
  /** Scope of the package */
  scope?: string;
  /** Links provided for the package */
  links?: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  /** */
  package?: PackageJson;
};

/** Message Return by the NPM Registry Search commend */
export type NPMRegistrySearchResponse = {
  objects: { package?: NpmRegistryPackage }[];
};

/** Prefix of the Otter module keyword tags */
export const OTTER_MODULE_PREFIX = 'otter-';
/** Otter NPM Keyword pattern */
export type OtterModuleTag<T extends string = ''> = `${typeof OTTER_MODULE_PREFIX}${T}`;
/** List of whitelisted package scopes for Otter modules */
export const OTTER_MODULE_SUPPORTED_SCOPES = ['otter', 'o3r'] as const;
/** Keyword defining an Otter compatible module */
export const OTTER_MODULE_KEYWORD: OtterModuleTag<'module'> = 'otter-module';
/** Package Keyword to identify the module allowing CMS administration */
export const OTTER_KEYWORD_CMS: OtterModuleTag<'cms'> = 'otter-cms';
