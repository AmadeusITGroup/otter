import {
  PullRequestService as PrService
} from '@o3r/azure-tools';

/**
 * Service to call AzureDevops API about PR
 * @deprecated will be removed in v12. Please use `PullRequestService` from `@o3r/azure-tools`
 */
export class PullRequestService extends PrService {}
