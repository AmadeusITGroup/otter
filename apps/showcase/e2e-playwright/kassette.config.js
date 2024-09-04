/**
 * Configuration of the mock server
 *
 * @returns { import('@amadeus-it-group/kassette').ConfigurationSpec } configuration
 */
exports.getConfiguration = () => {
  return {
    port: 4747,
    mocksFolder: `${__dirname}/mocks`,
    mode: 'remote',
    delay: 0,
    saveChecksumContent: true,
    saveDetailedTimings: false,
    saveForwardedRequestBody: false,
    saveForwardedRequestData: false,
    saveInputRequestBody: false,
    saveInputRequestData: false,
    hook: async ({mock}) => {
      if (/petstore3\.swagger\.io/.test(mock.request.url)) {
        mock.setMode('local_or_download');
        return;
      }
    }
  };
};
