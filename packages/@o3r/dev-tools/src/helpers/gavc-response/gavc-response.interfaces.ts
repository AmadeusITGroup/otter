

export interface GavcResponse {
  /** Ex : mvn-built */
  repo: string;

  /** Ex : /io/swagger/typescriptFetch-swagger-codegen/1.0.0/typescriptFetch-swagger-codegen-1.0.0.jar */
  path: string;

  /** Ex : 2018-07-06T17:14:14.123Z */
  created: string;

  /** Ex : anonymous */
  createdBy: string;

  /** Ex : 2018-07-06T17:14:14.031Z */
  lastModified: string;

  /** Ex : anonymous */
  modifiedBy: string;

  /** Ex : 2018-07-06T17:14:14.031Z */
  lastUpdated: string;

  /** Ex : https://jfrog.io/mvn-built/io/swagger/typescriptFetch-swagger-codegen/1.0.0/typescriptFetch-swagger-codegen-1.0.0.jar */
  downloadUri: string;

  /** Ex : application/java-archive */
  mimeType: string;

  /** Ex : 41800 */
  size: 41800;

  /**
   * Ex :
   * checksums : {
   *   sha1 : 4b12dc32f3ef1a10a872297423908b52bc1ce6ea;
   *   md5 : db17bea6a5f737f0644482055dcf2d36
   * };
   */
  checksums: { sha1: string; md5: string };

  /**
   * Ex :
   * originalChecksums : {
   *   sha1 : b12dc32f3ef1a10a872297423908b52bc1ce6ea;
   *   md5 : db17bea6a5f737f0644482055dcf2d36
   * };
   */
  originalChecksums: { sha1: string; md5: string };

  /** Ex : https://jfrog.io/api/storage/mvn-built/io/swagger/typescriptFetch-swagger-codegen/1.0.0/typescriptFetch-swagger-codegen-1.0.0.jar */
  uri: string;
}
