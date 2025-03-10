import {
  O3rKeepWhiteSpacePipe,
} from './keep-white-space.pipe';

describe('Keep white space pipe', () => {
  let pipe: O3rKeepWhiteSpacePipe;

  beforeEach(() => {
    pipe = new O3rKeepWhiteSpacePipe();
  });

  it('does nothing when no white spaces', () => {
    expect(pipe.transform('Guatemala')).toEqual('Guatemala');
  });

  it('should work with space inside the word', () => {
    expect(pipe.transform('French Guiana')).toEqual('French&nbsp;Guiana');
  });

  it('should do nothing when empty string', () => {
    expect(pipe.transform('')).toEqual('');
  });
});
