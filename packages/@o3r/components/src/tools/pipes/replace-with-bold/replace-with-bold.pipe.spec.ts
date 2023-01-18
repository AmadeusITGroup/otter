import {ReplaceWithBoldPipe} from './replace-with-bold.pipe';

describe('Replace with bold pipe', () => {
  let pipe: ReplaceWithBoldPipe;

  beforeEach(() => {
    pipe = new ReplaceWithBoldPipe();
  });

  it('search if the input match the label and change it to bold', () => {

    const transformedString = pipe.transform('Guatemala', 'te');

    expect(transformedString).toEqual('Gua<strong>te</strong>mala');
  });

  it('does nothing when no match', () => {

    const transformedString = pipe.transform('Guatemala', 'sp');

    expect(transformedString).toEqual('Guatemala');
  });

  it('should work with space inside the word', () => {

    const transformedString = pipe.transform('French Guiana', 'g');

    expect(transformedString).toEqual('French <strong>G</strong>uiana');
  });

  it('search input match - special character test', () => {

    const transformedString = pipe.transform('Finland (HEL)', '(H');

    expect(transformedString).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should ignore white spaces at the beginning', () => {

    const transformedString = pipe.transform('Finland (HEL)', '   (H');

    expect(transformedString).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should ignore white spaces', () => {

    const transformedString = pipe.transform('Finland (HEL)', '   (H ');

    expect(transformedString).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should not ignore white spaces in the middle (no matches)', () => {

    const transformedString = pipe.transform('Finland (HEL)', '   (H E');

    expect(transformedString).toEqual('Finland (HEL)');
  });

});
