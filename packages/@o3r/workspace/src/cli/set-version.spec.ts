import {
  createPlaceholderRegex,
  escapeForRegex,
  privateFieldRegex,
  wildcardVersionRegex,
  workspaceProtocolRegex,
} from './set-version-regexes';

describe('set-version CLI transformation', () => {
  /**
   * Helper function to simulate the full CLI transformation chain
   * @param content
   * @param version
   * @param placeholder
   * @param setPublic
   */
  const applySetVersionTransform = (
    content: string,
    version: string,
    placeholder = '0.0.0(-placeholder)?',
    setPublic = false
  ): string => {
    // Reset regex lastIndex since they have global flag
    workspaceProtocolRegex.lastIndex = 0;
    wildcardVersionRegex.lastIndex = 0;
    privateFieldRegex.lastIndex = 0;

    const placeholderRegex = createPlaceholderRegex(placeholder);
    let newContent = content
      .replace(placeholderRegex, `"$1${version}"`)
      .replace(workspaceProtocolRegex, `"$1${version}"$2`)
      .replace(wildcardVersionRegex, `"=$1"$2`);

    if (setPublic) {
      newContent = newContent.replace(privateFieldRegex, '');
    }

    return newContent;
  };

  describe('1. Placeholder version replacement (MAIN FEATURE)', () => {
    describe('placeholder: 0.0.0-placeholder (actual production use)', () => {
      it('should replace "0.0.0-placeholder" with target version', () => {
        const content = '{"version": "0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '1.2.3', '0.0.0-placeholder');
        expect(result).toBe('{"version": "1.2.3"}');
      });

      it('should preserve tilde prefix', () => {
        const content = '{"dep": "~0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '2.0.0', '0.0.0-placeholder');
        expect(result).toBe('{"dep": "~2.0.0"}');
      });

      it('should preserve caret prefix', () => {
        const content = '{"dep": "^0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '3.0.0', '0.0.0-placeholder');
        expect(result).toBe('{"dep": "^3.0.0"}');
      });

      it('should replace multiple occurrences', () => {
        const content = '{"version": "0.0.0-placeholder", "dep1": "~0.0.0-placeholder", "dep2": "^0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '4.5.6', '0.0.0-placeholder');
        expect(result).toContain('"version": "4.5.6"');
        expect(result).toContain('"dep1": "~4.5.6"');
        expect(result).toContain('"dep2": "^4.5.6"');
      });

      it('should work with pre-release versions', () => {
        const content = '{"version": "0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '1.0.0-alpha.1', '0.0.0-placeholder');
        expect(result).toBe('{"version": "1.0.0-alpha.1"}');
      });

      it('should work with build metadata', () => {
        const content = '{"version": "0.0.0-placeholder"}';
        const result = applySetVersionTransform(content, '2.0.0+build.123', '0.0.0-placeholder');
        expect(result).toBe('{"version": "2.0.0+build.123"}');
      });
    });

    describe('placeholder: 0.0.0 (simple version)', () => {
      it('should replace "0.0.0" with target version', () => {
        const content = '{"version": "0.0.0"}';
        const result = applySetVersionTransform(content, '1.2.3', '0.0.0');
        expect(result).toBe('{"version": "1.2.3"}');
      });

      it('should replace with tilde prefix', () => {
        const content = '{"dep": "~0.0.0"}';
        const result = applySetVersionTransform(content, '5.0.0', '0.0.0');
        expect(result).toBe('{"dep": "~5.0.0"}');
      });
    });

    describe('custom placeholder patterns', () => {
      it('should work with custom placeholder "1.0.0"', () => {
        const content = '{"version": "1.0.0"}';
        const result = applySetVersionTransform(content, '5.6.7', '1.0.0');
        expect(result).toBe('{"version": "5.6.7"}');
      });

      it('should work with placeholder "x.x.x"', () => {
        const content = '{"version": "x.x.x"}';
        const result = applySetVersionTransform(content, '10.0.0', 'x.x.x');
        expect(result).toBe('{"version": "10.0.0"}');
      });

      it('should work with complex placeholder pattern', () => {
        const content = '{"version": "0.0.0-dev"}';
        const result = applySetVersionTransform(content, '2.3.4', '0.0.0-dev');
        expect(result).toBe('{"version": "2.3.4"}');
      });
    });

    describe('placeholder regex escaping', () => {
      it('should escape special regex characters in placeholder', () => {
        const placeholderRegex = createPlaceholderRegex('0.0.0(-placeholder)?');
        // The parentheses and ? should be escaped
        expect(placeholderRegex.source).toContain('\\(');
        expect(placeholderRegex.source).toContain('\\)');
        expect(placeholderRegex.source).toContain('\\?');
      });

      it('should handle dots correctly (not as wildcard)', () => {
        const content = '{"version": "0.0.0", "other": "0x0x0"}';
        const result = applySetVersionTransform(content, '1.0.0', '0.0.0');
        expect(result).toContain('"version": "1.0.0"');
        expect(result).toContain('"other": "0x0x0"'); // Should NOT be replaced
      });
    });
  });

  describe('2. Workspace protocol replacement', () => {
    it('should replace workspace:* with version (and transform via wildcard regex)', () => {
      const content = '"@o3r/core": "workspace:*"';
      const result = applySetVersionTransform(content, '5.0.0');
      // workspace:* → *5.0.0 → =5.0.0 (due to wildcard version regex)
      expect(result).toBe('"@o3r/core": "=5.0.0"');
    });

    it('should replace workspace:~ with tilde version', () => {
      const content = '"@o3r/core": "workspace:~"';
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"@o3r/core": "~5.0.0"');
    });

    it('should replace workspace:^ with caret version', () => {
      const content = '"@o3r/core": "workspace:^"';
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"@o3r/core": "^5.0.0"');
    });

    it('should handle workspace protocol with existing version', () => {
      const content = '"@o3r/core": "workspace:^1.0.0"';
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"@o3r/core": "^5.0.0"');
    });

    it('should preserve trailing comma', () => {
      const content = '"@o3r/core": "workspace:*",';
      const result = applySetVersionTransform(content, '5.0.0');
      // workspace:* → *5.0.0 → =5.0.0
      expect(result).toBe('"@o3r/core": "=5.0.0",');
    });
  });

  describe('3. Wildcard version replacement (BUG FIX)', () => {
    it('should replace "*1.2.3" with "=1.2.3"', () => {
      const content = '"dep": "*1.2.3"';
      const result = applySetVersionTransform(content, '99.99.99'); // Version doesn't affect wildcard transform
      expect(result).toBe('"dep": "=1.2.3"');
    });

    it('should replace "*1.0.0-alpha.1" with "=1.0.0-alpha.1"', () => {
      const content = '"dep": "*1.0.0-alpha.1"';
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"dep": "=1.0.0-alpha.1"');
    });

    it('should preserve trailing comma', () => {
      const content = '"dep": "*2.0.0",';
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"dep": "=2.0.0",');
    });

    describe('CRITICAL: should NOT match glob patterns', () => {
      it('should NOT replace "**.metadata.json"', () => {
        const content = '"**.metadata.json"';
        const result = applySetVersionTransform(content, '5.0.0');
        expect(result).toBe('"**.metadata.json"');
      });

      it('should NOT replace "*.js"', () => {
        const content = '"*.js"';
        const result = applySetVersionTransform(content, '5.0.0');
        expect(result).toBe('"*.js"');
      });

      it('should NOT replace "**/*.ts"', () => {
        const content = '"**/*.ts"';
        const result = applySetVersionTransform(content, '5.0.0');
        expect(result).toBe('"**/*.ts"');
      });

      it('should NOT replace "*" alone', () => {
        const content = '"*"';
        const result = applySetVersionTransform(content, '5.0.0');
        expect(result).toBe('"*"');
      });
    });
  });

  describe('4. Private field removal (--set-public flag)', () => {
    it('should remove "private": true when on own line', () => {
      const content = `{
  "name": "test",
  "private": true,
  "version": "1.0.0"
}`;
      const result = applySetVersionTransform(content, '2.0.0', '1.0.0', true);
      expect(result).not.toContain('"private"');
      expect(result).toContain('"name"');
    });

    it('should NOT remove "private": true when on same line (regex limitation)', () => {
      const content = '{"name": "test", "private": true, "version": "1.0.0"}';
      const result = applySetVersionTransform(content, '2.0.0', '1.0.0', true);
      // Regex requires private field to be on its own line
      expect(result).toContain('"private": true');
    });

    it('should NOT remove "private": true when setPublic is false', () => {
      const content = '{"private": true}';
      const result = applySetVersionTransform(content, '2.0.0', '0.0.0(-placeholder)?', false);
      expect(result).toContain('"private": true');
    });

    it('should NOT remove "private": false', () => {
      const content = '{"private": false}';
      const result = applySetVersionTransform(content, '2.0.0', '0.0.0(-placeholder)?', true);
      expect(result).toContain('"private": false');
    });

    it('should handle indented private field', () => {
      const content = '  "private": true,';
      const result = applySetVersionTransform(content, '2.0.0', '0.0.0(-placeholder)?', true);
      expect(result).toBe('');
    });
  });

  describe('5. FULL TRANSFORMATION CHAIN (Integration)', () => {
    it('should apply all transformations in correct order', () => {
      const content = `{
  "name": "test-package",
  "version": "0.0.0-placeholder",
  "dependencies": {
    "@o3r/core": "workspace:~",
    "@o3r/common": "*1.2.3",
    "external": "^4.0.0"
  }
}`;
      const result = applySetVersionTransform(content, '5.0.0', '0.0.0-placeholder');

      // Placeholder replaced
      expect(result).toContain('"version": "5.0.0"');
      // Workspace protocol replaced
      expect(result).toContain('"@o3r/core": "~5.0.0"');
      // Wildcard version replaced
      expect(result).toContain('"@o3r/common": "=1.2.3"');
      // External dep unchanged
      expect(result).toContain('"external": "^4.0.0"');
    });

    it('should handle workspace:* -> *version -> =version chain', () => {
      const content = `{
  "dep": "workspace:*"
}`;
      const result = applySetVersionTransform(content, '3.0.0', '0.0.0-placeholder');
      // workspace:* → *3.0.0 → =3.0.0
      expect(result).toContain('"dep": "=3.0.0"');
    });

    it('should handle the reported bug scenario', () => {
      const content = `{
  "name": "@lhg/lhg-servicing",
  "version": "0.0.0",
  "files": [
    "dist/",
    "**.metadata.json",
    "cms.json"
  ]
}`;
      const result = applySetVersionTransform(content, '29.3.0-develop.18', '0.0.0');

      expect(result).toContain('"version": "29.3.0-develop.18"');
      expect(result).toContain('"**.metadata.json"'); // NOT changed
      expect(result).not.toContain('"=*.metadata.json"'); // Bug would cause this
    });

    it('should handle complex monorepo package.json', () => {
      const content = `{
  "name": "@o3r/workspace",
  "version": "0.0.0-placeholder",
  "private": true,
  "dependencies": {
    "@o3r/core": "workspace:~",
    "@o3r/schematics": "workspace:^",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@o3r/test": "workspace:*",
    "jest": "*29.0.0"
  },
  "peerDependencies": {
    "@angular/core": "^18.0.0",
    "@o3r/build": "workspace:~"
  },
  "files": [
    "dist/**",
    "*.d.ts",
    "**.metadata.json",
    "builders/**/*.json"
  ]
}`;
      const result = applySetVersionTransform(content, '14.0.0', '0.0.0-placeholder', true);

      // Version replaced
      expect(result).toContain('"version": "14.0.0"');
      // Workspace protocols replaced
      expect(result).toContain('"@o3r/core": "~14.0.0"');
      expect(result).toContain('"@o3r/schematics": "^14.0.0"');
      expect(result).toContain('"@o3r/test": "=14.0.0"'); // workspace:* becomes =version
      expect(result).toContain('"@o3r/build": "~14.0.0"');
      // Wildcard versions replaced
      expect(result).toContain('"jest": "=29.0.0"');
      // External deps unchanged
      expect(result).toContain('"lodash": "^4.17.21"');
      expect(result).toContain('"@angular/core": "^18.0.0"');
      // Glob patterns preserved
      expect(result).toContain('"dist/**"');
      expect(result).toContain('"*.d.ts"');
      expect(result).toContain('"**.metadata.json"');
      expect(result).toContain('"builders/**/*.json"');
      // Private removed
      expect(result).not.toContain('"private"');
    });

    it('should handle lerna.json', () => {
      const content = `{
  "version": "0.0.0",
  "packages": [
    "packages/*"
  ]
}`;
      const result = applySetVersionTransform(content, '10.0.0', '0.0.0');
      expect(result).toContain('"version": "10.0.0"');
      expect(result).toContain('"packages/*"'); // Glob preserved
    });

    it('should handle multiple transformations on multiple lines', () => {
      const content = `{
  "v1": "0.0.0",
  "v2": "workspace:*",
  "v3": "*1.0.0"
}`;
      const result = applySetVersionTransform(content, '8.0.0', '0.0.0');
      expect(result).toContain('"v1": "8.0.0"');
      expect(result).toContain('"v2": "=8.0.0"'); // workspace:* chain
      expect(result).toContain('"v3": "=1.0.0"');
    });
  });

  describe('6. Edge cases and corner scenarios', () => {
    it('should handle empty object', () => {
      const content = '{}';
      const result = applySetVersionTransform(content, '1.0.0');
      expect(result).toBe('{}');
    });

    it('should handle empty string', () => {
      const content = '';
      const result = applySetVersionTransform(content, '1.0.0');
      expect(result).toBe('');
    });

    it('should not match partial version patterns', () => {
      const content = '"dep": "*1.2"'; // Only major.minor
      const result = applySetVersionTransform(content, '5.0.0');
      expect(result).toBe('"dep": "*1.2"'); // Should NOT be replaced
    });

    it('should handle version with many pre-release parts', () => {
      const content = '{"version": "0.0.0"}';
      const result = applySetVersionTransform(content, '1.0.0-rc.1.alpha.2+build.456', '0.0.0');
      expect(result).toBe('{"version": "1.0.0-rc.1.alpha.2+build.456"}');
    });

    it('should preserve formatting and whitespace', () => {
      const content = `{
  "version":  "0.0.0"  ,
  "dep":   "workspace:*"
}`;
      const result = applySetVersionTransform(content, '2.0.0', '0.0.0');
      // Should preserve extra spaces
      expect(result).toMatch(/"version":\s+"2\.0\.0"/);
      expect(result).toMatch(/"dep":\s+"=2\.0\.0"/);
    });

    it('should handle versions in comments (JSON5/JSONC - best effort)', () => {
      const content = `{
  // version: "0.0.0"
  "version": "0.0.0"
}`;
      const result = applySetVersionTransform(content, '3.0.0', '0.0.0');
      // Both will be replaced (regex doesn't understand comments)
      const matches = result.match(/"3\.0\.0"/g);
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle no changes scenario', () => {
      const content = '{"name": "test", "main": "index.js"}';
      const result = applySetVersionTransform(content, '1.0.0');
      expect(result).toBe(content); // No changes
    });

    it('should handle mixed placeholder and workspace protocols', () => {
      const content = `{
  "version": "0.0.0-placeholder",
  "dep1": "~0.0.0-placeholder",
  "dep2": "workspace:~0.0.0"
}`;
      const result = applySetVersionTransform(content, '7.0.0', '0.0.0-placeholder');
      expect(result).toContain('"version": "7.0.0"');
      expect(result).toContain('"dep1": "~7.0.0"');
      expect(result).toContain('"dep2": "~7.0.0"');
    });
  });

  describe('7. Individual regex behavior (unit tests)', () => {
    describe('escapeForRegex', () => {
      it('should escape dots as literal characters', () => {
        expect(escapeForRegex('0.0.0')).toBe('0\\.0\\.0');
      });

      it('should escape parentheses and question mark', () => {
        expect(escapeForRegex('0.0.0(-placeholder)?')).toBe('0\\.0\\.0\\(\\-placeholder\\)\\?');
      });

      it('should escape caret, dollar, plus, pipe', () => {
        expect(escapeForRegex('a^b$c+d|e')).toBe('a\\^b\\$c\\+d\\|e');
      });

      it('should escape brackets and braces', () => {
        expect(escapeForRegex('[a]{b}')).toBe('\\[a\\]\\{b\\}');
      });

      it('should escape asterisk and slash', () => {
        expect(escapeForRegex('a*b/c')).toBe('a\\*b\\/c');
      });

      it('should leave alphanumeric and underscore unchanged', () => {
        expect(escapeForRegex('alpha_1')).toBe('alpha_1');
      });

      it('should produce a regex that matches the original string literally', () => {
        const result = escapeForRegex('0.0.0');
        const regex = new RegExp(result);
        expect('0.0.0').toMatch(regex);
        expect('0x0x0').not.toMatch(regex);
      });
    });

    describe('createPlaceholderRegex', () => {
      it('should create a global regex', () => {
        const regex = createPlaceholderRegex('0.0.0');
        expect(regex.flags).toContain('g');
      });

      it('should capture version prefix in group 1', () => {
        const regex = createPlaceholderRegex('0.0.0');
        const match = '"~0.0.0"'.match(regex);
        expect(match).toBeTruthy();
      });

      it('should match placeholder with optional suffix pattern', () => {
        const regex = createPlaceholderRegex('0.0.0(-placeholder)?');
        expect('"0.0.0(-placeholder)?"'.match(regex)).toBeTruthy();
        expect('"0.0.0"').not.toMatch(regex);
      });

      it('should not match when dots are replaced by other characters', () => {
        const regex = createPlaceholderRegex('0.0.0');
        expect('"0x0x0"').not.toMatch(regex);
      });

      it('should capture tilde prefix for replacement', () => {
        const regex = createPlaceholderRegex('0.0.0');
        const result = '"~0.0.0"'.replace(regex, '"$1REPLACED"');
        expect(result).toBe('"~REPLACED"');
      });

      it('should capture caret prefix for replacement', () => {
        const regex = createPlaceholderRegex('0.0.0');
        const result = '"^0.0.0"'.replace(regex, '"$1REPLACED"');
        expect(result).toBe('"^REPLACED"');
      });

      it('should capture empty prefix when no modifier present', () => {
        const regex = createPlaceholderRegex('0.0.0');
        const result = '"0.0.0"'.replace(regex, '"$1REPLACED"');
        expect(result).toBe('"REPLACED"');
      });
    });

    describe('workspaceProtocolRegex', () => {
      it('should be a global multiline regex', () => {
        expect(workspaceProtocolRegex.flags).toContain('g');
        expect(workspaceProtocolRegex.flags).toContain('m');
      });

      it('should only match at end of line', () => {
        const content = '"workspace:*" more text';
        expect(content.match(workspaceProtocolRegex)).toBeNull();
      });
    });

    describe('wildcardVersionRegex', () => {
      it('should be a global multiline regex', () => {
        expect(wildcardVersionRegex.flags).toContain('g');
        expect(wildcardVersionRegex.flags).toContain('m');
      });

      it('should require full semver (major.minor.patch)', () => {
        expect('"*1.2.3"'.match(wildcardVersionRegex)).toBeTruthy();
        expect('"*1.2"'.match(wildcardVersionRegex)).toBeNull();
        expect('"*1"'.match(wildcardVersionRegex)).toBeNull();
      });
    });

    describe('privateFieldRegex', () => {
      it('should be a global multiline regex', () => {
        expect(privateFieldRegex.flags).toContain('g');
        expect(privateFieldRegex.flags).toContain('m');
      });

      it('should only match "private": true (not false)', () => {
        expect('"private": true'.match(privateFieldRegex)).toBeTruthy();
        expect('"private": false'.match(privateFieldRegex)).toBeNull();
      });
    });
  });
});
