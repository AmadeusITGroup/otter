import {
  renderSdkContextTemplate,
  type SdkContextTemplateData,
} from './update-sdk-context.template';

describe('update-sdk-context.template', () => {
  const baseMockData: SdkContextTemplateData = {
    packageName: '@test/my-sdk',
    openApiVersion: '3.0.2',
    apiTitle: 'Test API',
    domainTree: '│   │   ├── pet/              # Pet operations...',
    domainsSection: `### pet
    **What this domain is about**: Pet operations
`,
    disambiguation: null
  };

  describe('renderSdkContextTemplate', () => {
    it('should render template with all fields populated', async () => {
      const result = await renderSdkContextTemplate(baseMockData);

      expect(result).toContain('# SDK Context for AI Tools');
      expect(result).toContain('**Package Name**: `@test/my-sdk`');
      expect(result).toContain('**OpenAPI Version**: `3.0.2`');
      expect(result).toContain('**API Title**: Test API');
      expect(result).toContain('│   │   ├── pet/');
      expect(result).toContain('### pet');
    });

    it('should use default disambiguation when null', async () => {
      const result = await renderSdkContextTemplate(baseMockData);

      expect(result).toContain('(No disambiguation notes added yet. Run with --interactive to add notes.)');
    });

    it('should include custom disambiguation when provided', async () => {
      const dataWithDisambiguation: SdkContextTemplateData = {
        ...baseMockData,
        disambiguation: 'Custom project notes here'
      };

      const result = await renderSdkContextTemplate(dataWithDisambiguation);

      expect(result).toContain('Custom project notes here');
      expect(result).not.toContain('(No disambiguation notes added yet');
    });

    it('should include all required sections', async () => {
      const result = await renderSdkContextTemplate(baseMockData);

      expect(result).toContain('## SDK Information');
      expect(result).toContain('## Project Structure');
      expect(result).toContain('## Domains');
      expect(result).toContain('## Important Guidelines');
      expect(result).toContain('### DO NOT');
      expect(result).toContain('### DO');
      expect(result).toContain('## User Disambiguation Notes');
    });

    it('should include generator attribution', async () => {
      const result = await renderSdkContextTemplate(baseMockData);

      expect(result).toContain('Generated with**: `@ama-sdk/schematics:typescript-core`');
      expect(result).toContain('amasdk-update-sdk-context');
    });
  });

  describe('sanitization', () => {
    it('should sanitize HTML tags in packageName', async () => {
      const maliciousData: SdkContextTemplateData = {
        ...baseMockData,
        packageName: '<script>alert("xss")</script>'
      };

      const result = await renderSdkContextTemplate(maliciousData);

      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should sanitize HTML tags in apiTitle', async () => {
      const maliciousData: SdkContextTemplateData = {
        ...baseMockData,
        apiTitle: '<img src=x onerror=alert(1)>'
      };

      const result = await renderSdkContextTemplate(maliciousData);

      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('should sanitize HTML tags in domainsSection', async () => {
      const maliciousData: SdkContextTemplateData = {
        ...baseMockData,
        domainsSection: '### pet\n<script>malicious()</script>'
      };

      const result = await renderSdkContextTemplate(maliciousData);

      expect(result).not.toContain('<script>malicious');
      expect(result).toContain('&lt;script&gt;malicious');
    });

    it('should sanitize HTML tags in disambiguation', async () => {
      const maliciousData: SdkContextTemplateData = {
        ...baseMockData,
        disambiguation: '<iframe src="evil.com"></iframe>'
      };

      const result = await renderSdkContextTemplate(maliciousData);

      expect(result).not.toContain('<iframe');
      expect(result).toContain('&lt;iframe');
    });

    it('should handle multiple angle brackets', async () => {
      const maliciousData: SdkContextTemplateData = {
        ...baseMockData,
        apiTitle: '<<dangerous>> API <test>'
      };

      const result = await renderSdkContextTemplate(maliciousData);

      expect(result).toContain('&lt;&lt;dangerous&gt;&gt; API &lt;test&gt;');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', async () => {
      const emptyData: SdkContextTemplateData = {
        packageName: '',
        openApiVersion: '',
        apiTitle: '',
        domainTree: '',
        domainsSection: '',
        disambiguation: null
      };

      const result = await renderSdkContextTemplate(emptyData);

      expect(result).toContain('# SDK Context for AI Tools');
      expect(result).toContain('**Package Name**: ``');
    });

    it('should handle special markdown characters in content', async () => {
      const specialCharsData: SdkContextTemplateData = {
        ...baseMockData,
        apiTitle: 'API with *asterisks* and _underscores_'
      };

      const result = await renderSdkContextTemplate(specialCharsData);

      expect(result).toContain('API with *asterisks* and _underscores_');
    });

    it('should handle newlines in domainsSection', async () => {
      const multilineData: SdkContextTemplateData = {
        ...baseMockData,
        domainsSection: '### pet\n\nFirst paragraph\n\nSecond paragraph\n'
      };

      const result = await renderSdkContextTemplate(multilineData);

      expect(result).toContain('First paragraph');
      expect(result).toContain('Second paragraph');
    });
  });
});
