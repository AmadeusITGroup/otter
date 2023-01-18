/**
 * Exception to indicate that the code run is for transpilation purpose only.
 * It should not be used during runtime process
 */
export class TranspilationPurposeOnlyError extends Error {
  constructor(message = 'Transpilation purpose only') {
    super(message);
    this.name = 'TranspilationPurposeOnly';
  }
}
