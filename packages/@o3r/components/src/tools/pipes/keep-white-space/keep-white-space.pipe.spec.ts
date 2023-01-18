import {KeepWhiteSpacePipe} from './keep-white-space.pipe';

describe('Keep white space pipe', () => {
  let pipe: KeepWhiteSpacePipe;

  beforeEach(() => {
    pipe = new KeepWhiteSpacePipe();
  });

  it('does nothing when no white spaces', () => {

    const transformedString = pipe.transform('Guatemala');

    expect(transformedString).toEqual('Guatemala');
  });

  it('should work with space inside the word', () => {

    const transformedString = pipe.transform('French Guiana');

    expect(transformedString).toEqual('French&nbsp;Guiana');
  });

  it('should do nothing when empty string', () => {

    const transformedString = pipe.transform('');

    expect(transformedString).toEqual('');
  });

});
