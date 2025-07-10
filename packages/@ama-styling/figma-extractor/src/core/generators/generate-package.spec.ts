describe('generatePackage', () => {
  test('should generate the NPM package file content', async () => {
    const { generatePackage } = require('./generate-package');
    const result = await generatePackage({ name: 'test', manifestFile: 'manifest-test.json', version: '1.2.3-test' });

    expect(result).toEqual({
      name: 'test',
      version: '1.2.3-test',
      exports: expect.objectContaining({
        '.': {
          default: './manifest-test.json'
        },
        './*.json': {
          default: './*.json'
        }
      })
    });
  });
});
