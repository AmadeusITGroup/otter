const currentPackage = {
  newPackage: '@ama-sdk/client-angular'
};

export const mapMigrationFromCoreImports = {
  '@ama-sdk/core': [
    'BaseApiAngularClientOptions',
    'BaseApiAngularClientConstructor',
    'ApiAngularClient',
    'MockInterceptAngular',
    'MockInterceptAngularParameters'
  ].reduce((acc, name) => ({ ...acc, [name]: currentPackage }), {} as Record<string, typeof currentPackage>)
};
