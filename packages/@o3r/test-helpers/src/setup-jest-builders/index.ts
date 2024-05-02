// Mock telemetry calls to avoid logging data and slowing down the tests
jest.mock('@o3r/extractors', () => ({
  ...jest.requireActual('@o3r/extractors'),
  createBuilderWithMetricsIfInstalled: jest.fn().mockImplementation((fn) => fn)
}));
jest.mock('@o3r/schematics', () => ({
  ...jest.requireActual('@o3r/schematics'),
  createSchematicWithMetricsIfInstalled: jest.fn().mockImplementation((fn) => fn)
}));
jest.mock('@o3r/telemetry', () => ({
  ...jest.requireActual('@o3r/telemetry'),
  createBuilderWithMetrics: jest.fn().mockImplementation((fn) => fn),
  createSchematicWithMetrics: jest.fn().mockImplementation((fn) => fn),
  sendData: jest.fn().mockImplementation((fn) => fn)
}));
