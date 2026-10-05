// Avoid loading the ESM-only terminal spinner through Angular DevKit CommonJS tasks.
vi.mock('ora', () => ({
  default: vi.fn(() => ({ fail: vi.fn(), start: vi.fn(), stop: vi.fn(), succeed: vi.fn() }))
}));
// Mock telemetry wrappers to keep builder tests local and deterministic.
vi.mock('@o3r/extractors', async () => ({
  ...(await vi.importActual('@o3r/extractors')),
  createBuilderWithMetricsIfInstalled: vi.fn().mockImplementation((fn) => fn)
}));
vi.mock('@o3r/schematics', async () => ({
  ...(await vi.importActual('@o3r/schematics')),
  createOtterSchematic: vi.fn().mockImplementation((fn) => fn)
}));
