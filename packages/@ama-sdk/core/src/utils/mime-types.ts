export const jsonRegex = /^(:?application\/json|[^\t /;]+\/[^\t /;]+\+json)[\t ]*(:?;.*)?$/i;

/**
 * Return true if the input corresponds to a JSON MIME type
 * @param mime
 */
export function isJsonMimeType(mime: string) {
  return jsonRegex.test(mime);
}
