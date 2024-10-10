import {formatGitTagsOutput} from './index';

describe('helpers', () => {
  it('formatGitBranchOutput', () => {
    const fakeOutput = '  0.10.0 \n 3.1.5 \n 3.2.4 \n 3.2.5.0 \n  whatever  \n 3.3.0-alpha.0';
    expect(formatGitTagsOutput(fakeOutput)).toEqual(['0.10.0', '3.1.5', '3.2.4', '3.2.5.0', 'whatever', '3.3.0-alpha.0']);
  });
});
