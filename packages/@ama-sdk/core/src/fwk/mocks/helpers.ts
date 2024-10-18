import { PathObject } from './path-object';

/**
 * Gets an operation ID from a path object and HTTP method
 * @param pathObject the path object to check on
 * @param method the HTTP method
 */
export function getOperationId(pathObject: PathObject, method: string): string | undefined {
  const lcMethod = method.toLowerCase();
  const operation = pathObject.operations.find((item) =>
    item.method === lcMethod
  );
  if (!operation) {
    return;
  }
  return operation.operationId || `${pathObject.path}_${lcMethod}`;
}

/**
 * Gets a PathObject from a requested URL
 * @param requestUrl the URL string
 * @param pathObjects the list of available path objects
 * @param method the optional HTTP method used in case of several matches
 */
export function getPath(requestUrl: string, pathObjects: PathObject[], method?: string): PathObject | undefined {
  const pathName = new URL(requestUrl, requestUrl.startsWith('/') ? 'http://example.com' : undefined).pathname;

  if (!pathName) {
    throw new Error(`Couldn't parse url ${requestUrl}`);
  }

  // Find all matching paths
  let matches = pathObjects.reduce<{index: number; segments: string[]; methods: string[]}[]>((newMatches, pathObject, index) => {
    if (pathObject.regexp.test(pathName)) {
      newMatches.push({
        index,
        segments: pathObject.path.split('/'),
        methods: pathObject.operations.map((operation) => operation.method)
      });
    }
    return newMatches;
  }, []);

  let lastIndex = -1;
  let nextIndex = -1;
  while (matches.length > 1) {
    matches = matches.reduce<{index: number; segments: string[]; methods: string[]}[]>((newMatches, match) => {
      let newIndex = match.segments.findIndex((segment) => segment.startsWith('{') && segment.endsWith('}'));
      // Complete static match so use some value that can't be exceeded
      if (newIndex === -1) {
        newIndex = Infinity;
      }

      if (newIndex > nextIndex) {
        nextIndex = newIndex;
        newMatches = [match];
      } else if (newIndex === nextIndex) {
        newMatches.push(match);
      }

      return newMatches;
    }, []);

    // At this point we have tried to filter the matches but there are multiple matches that are identical and cannot
    // be filtered further. Trying to filter on the HTTP method if provided, then choose the first match.
    if (lastIndex === nextIndex) {
      if (method) {
        // Try to filter the multiple matches based on the HTTP method
        matches.splice(0, matches.findIndex((match) => match.methods.includes(method.toLowerCase())));
      }
      matches.splice(1);
    }

    lastIndex = nextIndex;
  }

  return matches.length > 0 ? pathObjects[matches[0].index] : undefined;
}
