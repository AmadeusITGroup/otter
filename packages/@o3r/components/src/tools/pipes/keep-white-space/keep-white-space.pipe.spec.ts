import {KeepWhiteSpacePipe, O3rKeepWhiteSpacePipe} from './keep-white-space.pipe';

describe('Keep white space pipe', () => {
  let pipe: O3rKeepWhiteSpacePipe;
  let deprecatedPipe: KeepWhiteSpacePipe;

  beforeEach(() => {
    pipe = new O3rKeepWhiteSpacePipe();
    deprecatedPipe = new KeepWhiteSpacePipe();
  });

  it('does nothing when no white spaces', () => {
    expect(pipe.transform('Guatemala')).toEqual('Guatemala');
    expect(deprecatedPipe.transform('Guatemala')).toEqual('Guatemala');
  });

  it('should work with space inside the word', () => {
    expect(pipe.transform('French Guiana')).toEqual('French&nbsp;Guiana');
    expect(deprecatedPipe.transform('French Guiana')).toEqual('French&nbsp;Guiana');
  });

  it('should do nothing when empty string', () => {
    expect(pipe.transform('')).toEqual('');
    expect(deprecatedPipe.transform('')).toEqual('');
  });
});
