/**
 * Model: GetImages200Response
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



export interface GetImages200Response {
  /** For successful requests, this value is always `null`. */
  err: string | null;
  /** A map from node IDs to URLs of the rendered images. */
  images: Record<string, string>;
}


