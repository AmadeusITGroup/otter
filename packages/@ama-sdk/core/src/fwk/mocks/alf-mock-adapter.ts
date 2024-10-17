import { MockMap } from './base-mock-adapter';
import { getOperationId, getPath } from './helpers';
import { PathObject } from './path-object';
import { SequentialMockAdapter } from './sequential-mock-adapter';

/**
 * a new call is detected thanks to the timestamp printed by ALF on a new line, ex: "2021/12/16 18:21:28.312472 "
 */
const logNewCallRegex = new RegExp(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d{6}\b/gm);

/**
 * the correlation Id is printed this way by ALF, ex: CorrID=0001W37ZH480AJ,
 */
const correlationIdRegex = new RegExp(/CorrID=([^,]*),/);

/**
 * a request is logged with its HTTP method and the path targetted on a new line, ex: "GET /1ASIUAIRFAC/v2/shopping..."
 */
const requestRegex = new RegExp(/^(POST|GET|PATCH|DELETE) \/([^\s]*)/m);

/**
 * a request is logged with its HTTP version and the HTTP status on a new line, ex: "HTTP/1.1 200 OK"
 */
const responseRegex = new RegExp(/^(HTTP\/1.1 \d{3})/m);

/**
 * the response data is logged with its JSON content on a new line
 */
const requestResponseJsonRegexp = new RegExp(/(^{.*}$)/m);

/**
 * Interface for any call found in the ALF traces
 */
interface AlfCall {
  corrId: string;
  operationId: string | undefined;
  method: string;
  request?: string;
  response?: string;
}

/**
 * Split the logs
 * @param log alf log
 * @returns an array containing one message each
 */
function splitCalls(log: string): string[] {
  return log.split(logNewCallRegex);
}

/**
 * Get AlfCall corresponding to this log if it is a request received by the SI
 * @param log alf log
 * @param corrId correlationId
 * @param operationAdapter operation adapter to bind each request with its operationId
 * @returns AlfCall if found, undefined otherwise
 */
function getRequest(log: string, corrId: string, operationAdapter: PathObject[]): AlfCall | undefined {
  // Checking if the log starts by POST|GET|PATCH|DELETE to detect that it is a request
  const match = log.match(requestRegex);
  if (match && match[1] && match[2]) {
    // the match looks like this 1ASIUAIRFAC/v2/shopping/carts/19DXNCKB931CYX3S?refresh=true
    // so we remove the SAP information at the beginning and URL parameters at the end if any
    const requestUrl = match[2].substring(match[2].indexOf('/'), match[2].includes('?') ? match[2].indexOf('?') : match[2].length);
    const method = match[1];
    const pathObject = getPath(requestUrl, operationAdapter, method);
    if (pathObject) {
      const operationId = getOperationId(pathObject, method);
      return {
        corrId,
        method,
        operationId
      };
    }
  }
}

/**
 * Returns true if log is detected as a HTTP response
 * @param log alf log
 * @returns true if found
 */
function isResponse(log: string): boolean {
  const match = log.match(responseRegex);
  return !!match && !!match[1];
}

/**
 * Return JSON data found
 * @param log alf log
 * @returns JSON data that can be either the request or the response
 */
function getData(log: string): string {
  const match = log.match(requestResponseJsonRegexp);
  return match && match[1] || '';
}

/**
 * Retrieve path from logPath and parse it to find all the calls.
 * If the logs file contains more than one entry point this methods will separate them in Steps.
 * First call will represent the request and last call the response.
 * @param log Content of the alf logs
 * @param operationAdapter operation adapter to bind each request/response with its operationId
 * @returns an array of AlfCall found in the logs
 */
function buildAlfCalls(log: string, operationAdapter: PathObject[]): AlfCall[] {
  // we split the logs per call logged by ALF
  const callMatches = splitCalls(log);
  // an array containing all the request/response found in the alf logs
  const alfCalls: AlfCall[] = [];

  for (const callMatch of callMatches) {
    // we look for corrID to be able to match request and response
    const match = callMatch.match(correlationIdRegex);
    const corrId = match?.[1];
    if (!corrId) {
      // without correlationId it will be impossible to match the response with the request
      continue;
    }
    const request = getRequest(callMatch, corrId, operationAdapter);
    const response = isResponse(callMatch);
    if ((request || response) && corrId) {
      // we check if there were already a call with this correlationId
      const alfCall = alfCalls.find((value) => value.corrId === corrId);
      const data = getData(callMatch);
      if (alfCall && response) {
        // this is a response and there were already an alfCall with this correlationId
        // so we found the response of our request
        alfCall.response = data;
      } else if (request && !alfCall) {
        // this is a request but no other call with this correlationId were found
        // hence it is a new request that we push into our array of alfCalls
        alfCalls.push({
          ...request,
          corrId,
          request: data
        });
      }
    }
  }

  return alfCalls;
}

/**
 * Build the actual mock map corresponding to these alfCalls
 * @param log Content of the alf logs
 * @param operationAdapter operation adapter to bind each request/response with its operationId
 * @returns mock map, key is the operation id, value is an array of the API replies
 */
function buildMockMap(log: string, operationAdapter: PathObject[]): MockMap {
  // Get the array of calls from the alf log
  const alfCalls = buildAlfCalls(log, operationAdapter);

  // build the mock map for each operationId in sequential
  const mock = alfCalls.filter((alfCall) => alfCall.operationId).reduce<Record<string, any[]>>((mockMap, alfCall) => {
    if (!mockMap[alfCall.operationId!]) {
      mockMap[alfCall.operationId!] = [];
    }

    mockMap[alfCall.operationId!].push({
      mockData: alfCall.response ? JSON.parse(alfCall.response) : ''
    });
    return mockMap;
  }, {});
  return mock;
}

/**
 * Get the mock adapter corresponding to the logs retrieved from ALF
 * @param binFilePath the path to the file containing the logs downloaded from Alf in .bin format
 * @param operationAdapter an array of PathObject or a function that returns an array of PathObject or a Promise that resolves to an array of PathObject, to map request with their operationId
 * @returns a sequential mock adapter containing each response found in Alf
 */
export function getAlfMockAdapter(binFilePath: string, operationAdapter: PathObject[] | (() => PathObject[] | Promise<PathObject[]>)): SequentialMockAdapter {
  return new SequentialMockAdapter(operationAdapter, async () => {
    const response = await fetch(binFilePath);
    if (response.ok) {
      const content = await response.text();

      const adapter = typeof operationAdapter === 'function' ? await operationAdapter() : operationAdapter;
      return buildMockMap(content, adapter);
    }
    return {};
  });
}
