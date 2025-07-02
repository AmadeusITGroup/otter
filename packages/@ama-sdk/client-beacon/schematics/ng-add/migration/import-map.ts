const currentPackage = {
  newPackage: '@ama-sdk/client-beacon'
};

export const mapMigrationFromCoreImports = {
  '@ama-sdk/core': [
    'BaseApiBeaconClientOptions',
    'BaseApiBeaconClientConstructor',
    'ApiBeaconClient'
  ].reduce((acc, name) => ({ ...acc, [name]: currentPackage }), {} as Record<string, typeof currentPackage>)
};
