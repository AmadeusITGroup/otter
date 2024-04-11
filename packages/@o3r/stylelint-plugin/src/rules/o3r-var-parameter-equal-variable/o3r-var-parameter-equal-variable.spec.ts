import { lint } from 'stylelint';
import plugins from '../../index.mts';

const config = {
  plugins,
  'rules': {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@o3r/o3r-var-parameter-equal-variable': true
  }
};

describe('o3r-var-parameter-equal-variable', () => {
  test('should import otter styling with alias', async ()=> {
    const res = await lint({
      config,
      code: `@use '@o3r/styling' as otter;
        $test: otter.variable('test', 0);`
    });
    expect(res.errored).toBe(false);
  });

  test('should import otter styling with another alias', async () => {
    const res = await lint({
      config,
      code: `@use '@o3r/styling' as o3r;
        $more-complex-test-case-1: o3r.variable('more-complex-test-case-1', 0);`
    });
    expect(res.errored).toBe(false);
  });


  test('should not be executed on the declaration when o3r styling is not imported', async () => {
    const res = await lint({
      config,
      code: '$test: o3r.variable(\'test-valid\', 0);'
    });
    expect(res.errored).toBe(false);
  });

  test('should fail when variable name is not aligned', async () => {
    const res = await lint({
      config,
      code: `@use '@o3r/styling' as o3r;
        $test: o3r.variable('test-invalid', 0);`
    });
    expect(res.errored).toBe(true);
    expect(res.results[0].warnings.length).toBe(1);
    expect(res.results[0].warnings[0]).toEqual(expect.objectContaining({
      line: 2,
      endLine: 2,
      text: 'o3r.variable parameter doesn\'t match variable name: "test-invalid" vs "test" (@o3r/o3r-var-parameter-equal-variable)'
    }));
  });
});
