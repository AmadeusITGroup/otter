const existsSyncMock = jest.fn();
const readFileSyncMock = jest.fn();
const loadSdkContextsMock = jest.fn();

jest.mock('node:fs', () => ({
  existsSync: existsSyncMock,
  readFileSync: readFileSyncMock
}));

jest.mock('../helpers/context', () => ({
  ...jest.requireActual('../helpers/context'),
  loadSdkContexts: loadSdkContextsMock
}));

/* eslint-disable import/first -- needed to mock modules before importing the tested module */
import type {
  AmaMcpServer,
} from '@ama-mcp/core';
import type {
  SdkContextInfo,
} from '../helpers/context';
import {
  registerSdkContextToolAndResources,
  type SdkContextResponse,
} from './mcp-server';

const mockServer = {
  registerResource: jest.fn(),
  registerTool: jest.fn()
} as unknown as AmaMcpServer;

describe('mcp-server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    readFileSyncMock.mockReturnValue('');
    loadSdkContextsMock.mockReturnValue([]);
  });

  describe('registerSdkContextToolAndResources', () => {
    it('should register both resources and tool', () => {
      registerSdkContextToolAndResources(mockServer, {
        sdkPackages: []
      });

      expect(mockServer.registerTool).toHaveBeenCalled();
    });

    it('should register instructions resource when INSTRUCTIONS.md exists', () => {
      const instructionsContent = '# SDK Context Usage Instructions';
      existsSyncMock.mockImplementation((path: string) =>
        path.includes('INSTRUCTIONS.md')
      );
      readFileSyncMock.mockReturnValue(instructionsContent);

      registerSdkContextToolAndResources(mockServer, {
        sdkPackages: []
      });

      expect(mockServer.registerResource).toHaveBeenCalledWith(
        'SDK Context Instructions',
        'sdk-context://instructions',
        expect.objectContaining({
          title: 'SDK Context Usage Instructions',
          mimeType: 'text/markdown'
        }),
        expect.any(Function)
      );
    });

    it('should register SDK context resources', () => {
      const mockContexts: SdkContextInfo[] = [{
        packageName: '@test/sdk',
        content: '# SDK Documentation',
        uri: 'sdk-context://-test-sdk'
      }];
      loadSdkContextsMock.mockReturnValue(mockContexts);

      registerSdkContextToolAndResources(mockServer, {
        sdkPackages: ['@test/sdk']
      });

      expect(mockServer.registerResource).toHaveBeenCalledWith(
        'SDK Context: @test/sdk',
        'sdk-context://-test-sdk',
        expect.objectContaining({
          title: 'SDK Context for @test/sdk',
          mimeType: 'text/markdown'
        }),
        expect.any(Function)
      );
    });
  });

  describe('sdkContextRetriever', () => {
    let sdkContextRetriever: (args: { packageName: string }) => SdkContextResponse;
    const sdkContent = '# SDK Documentation';

    beforeEach(() => {
      const mockContexts: SdkContextInfo[] = [{
        packageName: '@test/sdk',
        content: sdkContent,
        uri: 'sdk-context://-test-sdk'
      }];
      loadSdkContextsMock.mockReturnValue(mockContexts);

      registerSdkContextToolAndResources(mockServer, {
        sdkPackages: ['@test/sdk']
      });

      sdkContextRetriever = (mockServer.registerTool as any).mock.calls[0][2];
    });

    it('should return context for specific package', () => {
      const result = sdkContextRetriever({ packageName: '@test/sdk' });

      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        type: 'text',
        text: sdkContent
      });
      expect(result.content[1]).toEqual({
        type: 'resource_link',
        name: 'SDK Context: @test/sdk',
        uri: 'sdk-context://-test-sdk'
      });
    });

    it('should return error for invalid package name', () => {
      const result = sdkContextRetriever({ packageName: '../malicious' });
      expect(result.content[0].type).toBe('text');
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('Invalid package name');
    });

    it('should return not found for unconfigured package', () => {
      const result = sdkContextRetriever({ packageName: '@other/package' });
      expect(result.content[0].type).toBe('text');
      expect((result.content[0] as { type: 'text'; text: string }).text).toContain('No SDK_CONTEXT.md found');
    });
  });
});
