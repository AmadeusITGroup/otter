/**
 * Exception to indicate that a fixture is being used with invalid parameters.
 */
export class FixtureUsageError extends Error {
  constructor(message = 'Fixture usage error') {
    super(message);
    this.name = 'FixtureUsageError';
  }
}
