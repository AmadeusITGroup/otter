/* eslint-disable no-console -- local script */
// TODO: remove once https://github.com/AmadeusITGroup/prompt-registry/issues/86 resolved
/**
 * Collection Validation Script
 *
 * Standalone script to validate awesome-copilot collection files.
 * Can be run locally or in CI/CD pipelines.
 *
 * Validation logic matches VS Code extension for consistency:
 * - Schema validation (required fields, types, formats)
 * - File reference checking
 * - Tag limits and formatting
 *
 * Attribution: Inspired by github/awesome-copilot
 * https://github.com/github/awesome-copilot
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  load,
} from 'js-yaml';

// ANSI color codes for terminal output
const colors = {
  reset: '\u001B[0m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  cyan: '\u001B[36m',
  bold: '\u001B[1m'
};

// Validation constants (match VS Code extension)
const VALID_KINDS = ['prompt', 'instruction', 'chat-mode', 'agent', 'skill'];
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MAX_ITEMS = 50;
const ID_PATTERN = /^[a-z0-9-]+$/;

/**
 * Validate a single collection file
 * @param {string} filePath - Path to collection file
 * @param {string} projectRoot - Project root for resolving references
 * @param {boolean} checkRefs - Whether to validate file references exist
 * @returns {object} Validation result
 */
export function validateCollection(filePath, projectRoot, checkRefs = true) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);

  try {
    // Read and parse YAML
    const content = fs.readFileSync(filePath, 'utf8');
    let collection;

    try {
      collection = load(content);
    } catch (parseError) {
      return {
        valid: false,
        errors: [{ file: fileName, message: `Failed to parse YAML: ${parseError.message}` }],
        warnings: []
      };
    }

    if (!collection || typeof collection !== 'object') {
      return {
        valid: false,
        errors: [{ file: fileName, message: 'Empty or invalid YAML file' }],
        warnings: []
      };
    }

    // REQUIRED FIELDS VALIDATION (matches JSON schema)
    if (!collection.id) {
      errors.push({ file: fileName, message: 'Missing required field: id' });
    }
    if (!collection.name) {
      errors.push({ file: fileName, message: 'Missing required field: name' });
    }
    if (!collection.description) {
      errors.push({ file: fileName, message: 'Missing required field: description' });
    }
    if (!collection.items || !Array.isArray(collection.items)) {
      errors.push({ file: fileName, message: 'Missing or invalid field: items (must be an array)' });
    }

    // ID FORMAT VALIDATION
    if (collection.id && !ID_PATTERN.test(collection.id)) {
      errors.push({
        file: fileName,
        message: 'Invalid id format (must be lowercase letters, numbers, and hyphens only)'
      });
    }

    // DESCRIPTION LENGTH VALIDATION
    if (collection.description && collection.description.length > MAX_DESCRIPTION_LENGTH) {
      warnings.push({
        file: fileName,
        message: `Description is longer than recommended (${MAX_DESCRIPTION_LENGTH} characters)`
      });
    }

    // ITEMS VALIDATION
    if (collection.items && Array.isArray(collection.items)) {
      if (collection.items.length === 0) {
        warnings.push({ file: fileName, message: 'Collection has no items' });
      }

      if (collection.items.length > MAX_ITEMS) {
        warnings.push({
          file: fileName,
          message: `Collection has more than ${MAX_ITEMS} items (recommended max)`
        });
      }

      collection.items.forEach((item, index) => {
        const itemNumber = index + 1;

        // Required item fields
        if (!item.path) {
          errors.push({ file: fileName, message: `Item ${itemNumber}: Missing required field 'path'` });
        }
        if (!item.kind) {
          errors.push({ file: fileName, message: `Item ${itemNumber}: Missing required field 'kind'` });
        } else if (!VALID_KINDS.includes(item.kind)) {
          errors.push({
            file: fileName,
            message: `Item ${itemNumber}: Invalid 'kind' value (must be one of: ${VALID_KINDS.join(', ')})`
          });
        }

        // FILE REFERENCE VALIDATION (when enabled)
        if (checkRefs && item.path) {
          const itemPath = path.join(projectRoot, item.path);
          if (!fs.existsSync(itemPath)) {
            errors.push({
              file: fileName,
              message: `Item ${itemNumber}: Referenced file does not exist: ${item.path}`
            });
          }
        }
      });
    }

    // TAGS VALIDATION
    if (collection.tags) {
      if (Array.isArray(collection.tags)) {
        if (collection.tags.length > MAX_TAGS) {
          warnings.push({
            file: fileName,
            message: `More than ${MAX_TAGS} tags (recommended max)`
          });
        }

        collection.tags.forEach((tag, index) => {
          const tagNumber = index + 1;
          if (typeof tag !== 'string') {
            errors.push({ file: fileName, message: `Tag ${tagNumber}: Must be a string` });
          } else if (tag.length > MAX_TAG_LENGTH) {
            warnings.push({
              file: fileName,
              message: `Tag ${tagNumber}: Longer than ${MAX_TAG_LENGTH} characters`
            });
          }
        });
      } else {
        errors.push({ file: fileName, message: 'Tags must be an array' });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    return {
      valid: false,
      errors: [{ file: fileName, message: `Unexpected error: ${error.message}` }],
      warnings: []
    };
  }
}

/**
 * Main validation function
 */
function main() {
  console.log(`${colors.cyan}${colors.bold}📋 Collection Validation${colors.reset}\n`);
  console.log(`${colors.cyan}Attribution: Inspired by github/awesome-copilot${colors.reset}`);
  console.log(`${colors.cyan}https://github.com/github/awesome-copilot${colors.reset}\n`);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const skipRefs = args.includes('--skip-refs') || args.includes('--no-check-refs');

  if (skipRefs) {
    console.log(`${colors.yellow}⚠️  File reference checking disabled${colors.reset}\n`);
  }

  // Find collections directory
  const projectRoot = process.cwd();
  const collectionsDir = path.join(projectRoot, 'collections');

  if (!fs.existsSync(collectionsDir)) {
    const errorMessage = `Collections directory not found: ${collectionsDir}`;
    console.error(`${colors.red}❌ Error: ${errorMessage}${colors.reset}`);
    throw new Error(errorMessage);
  }

  // Find all collection files
  const files = fs.readdirSync(collectionsDir)
    .filter((f) => f.endsWith('.collection.yml'))
    .toSorted();

  if (files.length === 0) {
    console.log(`${colors.yellow}⚠️  No collection files found in ${collectionsDir}${colors.reset}`);
    return;
  }

  console.log(`Found ${files.length} collection(s)\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let validCollections = 0;

  // Validate each collection
  for (const file of files) {
    const filePath = path.join(collectionsDir, file);
    const result = validateCollection(filePath, projectRoot, !skipRefs);

    console.log(`Validating: ${colors.bold}${file}${colors.reset}`);

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`  ${colors.green}✓ Valid${colors.reset}`);
      validCollections++;
    } else {
      if (result.errors.length > 0) {
        result.errors.forEach((err) => {
          console.log(`  ${colors.red}✗ Error: ${err.message}${colors.reset}`);
        });
        totalErrors += result.errors.length;
      }
      if (result.warnings.length > 0) {
        result.warnings.forEach((warn) => {
          console.log(`  ${colors.yellow}⚠ Warning: ${warn.message}${colors.reset}`);
        });
        totalWarnings += result.warnings.length;
      }
    }
    console.log('');
  }

  // Print summary
  console.log('='.repeat(60));
  console.log(`Summary: ${validCollections}/${files.length} collections valid`);

  if (totalErrors > 0) {
    console.log(`${colors.red}Total Errors: ${totalErrors}${colors.reset}`);
  } else {
    console.log(`${colors.green}Total Errors: ${totalErrors}${colors.reset}`);
  }

  if (totalWarnings > 0) {
    console.log(`${colors.yellow}Total Warnings: ${totalWarnings}${colors.reset}`);
  } else {
    console.log(`${colors.green}Total Warnings: ${totalWarnings}${colors.reset}`);
  }

  console.log('='.repeat(60));

  // Exit with appropriate code
  if (totalErrors > 0) {
    const errorMessage = `Validation failed`;
    console.log(`\n${colors.red}❌ ${errorMessage}${colors.reset}`);
    throw new Error(errorMessage);
  } else if (totalWarnings > 0) {
    console.log(`\n${colors.yellow}⚠️  Validation passed with warnings${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ All collections valid!${colors.reset}`);
  }
}

main();
