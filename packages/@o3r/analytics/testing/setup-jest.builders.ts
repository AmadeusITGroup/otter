// Cannot use '@o3r/test-helpers/setup-jest-builders' because it tries to mock @o3r/extractors
// which creates a Yarn PnP resolution error (extractors/telemetry are not in analytics dependencies)
// Analytics schematic tests don't need these telemetry mocks anyway
