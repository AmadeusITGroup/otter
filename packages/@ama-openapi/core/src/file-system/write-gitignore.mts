import { promises as fs } from "node:fs";
import type { Manifest } from "../public_api.mjs";

/**
 * Write a .gitignore file in the dependency output folder to ignore all files.
 * @param manifest
 * @returns
 */
export const writeGitIgnore = (manifest: Manifest) => {
  return fs.writeFile(
    `${manifest.dependencyOutput}/.gitignore`,
    `# Ignore all files in this directory\n*\n`,
    { encoding: "utf8" }
  );
}
