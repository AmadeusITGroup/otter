import 'isomorphic-fetch';
// Mock telemetry wrappers to keep builder tests local and deterministic.
vi.mock('@o3r/extractors', async () => ({
  ...(await vi.importActual('@o3r/extractors')),
  createBuilderWithMetricsIfInstalled: vi.fn().mockImplementation((fn) => fn)
}));
vi.mock('@o3r/schematics', async () => ({
  ...(await vi.importActual('@o3r/schematics')),
  createOtterSchematic: vi.fn().mockImplementation((fn) => fn)
}));
