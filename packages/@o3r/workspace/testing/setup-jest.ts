import 'jest-preset-angular/setup-jest';

jest.mock('node:fs', () => {
  const originalModule = jest.requireActual('node:fs');
  let mockedFiles: Record<string, string> = {};
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    ...originalModule,
    readFileSync: (filePath: string, options: any) => mockedFiles[filePath] ?? originalModule.readFileSync.call(originalModule, filePath, options),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __mockFiles: (mockFiles: Record<string, string>) => {
      mockedFiles = mockFiles;
    }
  };
});
