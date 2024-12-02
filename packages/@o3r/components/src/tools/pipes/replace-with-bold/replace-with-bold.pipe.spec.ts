import {
  O3rReplaceWithBoldPipe,
  ReplaceWithBoldPipe,
} from './replace-with-bold.pipe';

describe('Replace with bold pipe', () => {
  let pipe: O3rReplaceWithBoldPipe;
  let deprecatedPipe: ReplaceWithBoldPipe;

  beforeEach(() => {
    pipe = new O3rReplaceWithBoldPipe();
    deprecatedPipe = new ReplaceWithBoldPipe();
  });

  it('search if the input match the label and change it to bold', () => {
    expect(pipe.transform('Guatemala', 'te')).toEqual('Gua<strong>te</strong>mala');
    expect(deprecatedPipe.transform('Guatemala', 'te')).toEqual('Gua<strong>te</strong>mala');
  });

  it('does nothing when no match', () => {
    expect(pipe.transform('Guatemala', 'sp')).toEqual('Guatemala');
    expect(deprecatedPipe.transform('Guatemala', 'sp')).toEqual('Guatemala');
  });

  it('should work with space inside the word', () => {
    expect(pipe.transform('French Guiana', 'g')).toEqual('French <strong>G</strong>uiana');
    expect(deprecatedPipe.transform('French Guiana', 'g')).toEqual('French <strong>G</strong>uiana');
  });

  it('search input match - special character test', () => {
    expect(pipe.transform('Finland (HEL)', '(H')).toEqual('Finland <strong>(H</strong>EL)');
    expect(deprecatedPipe.transform('Finland (HEL)', '(H')).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should ignore white spaces at the beginning', () => {
    expect(pipe.transform('Finland (HEL)', '   (H')).toEqual('Finland <strong>(H</strong>EL)');
    expect(deprecatedPipe.transform('Finland (HEL)', '   (H')).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should ignore white spaces', () => {
    expect(pipe.transform('Finland (HEL)', '   (H ')).toEqual('Finland <strong>(H</strong>EL)');
    expect(deprecatedPipe.transform('Finland (HEL)', '   (H ')).toEqual('Finland <strong>(H</strong>EL)');
  });

  it('should not ignore white spaces in the middle (no matches)', () => {
    expect(pipe.transform('Finland (HEL)', '   (H E')).toEqual('Finland (HEL)');
    expect(deprecatedPipe.transform('Finland (HEL)', '   (H E')).toEqual('Finland (HEL)');
  });
});
