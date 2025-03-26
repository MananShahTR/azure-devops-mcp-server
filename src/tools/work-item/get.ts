import { getWorkItemTrackingApi } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { ApiError, NotFoundError } from '../../errors.js';

export function getWorkItem(config: AzureDevOpsConfig) {
  return async (args: any) => {
    try {
      const { ids, fields, asOf, $expand, errorPolicy } = args;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('At least one work item ID must be provided');
      }

      const witApi = await getWorkItemTrackingApi(config);
      
      const workItems = await witApi.getWorkItems(
        ids,
        fields,
        asOf ? new Date(asOf) : undefined,
        $expand,
        errorPolicy
      );

      if (!workItems || workItems.length === 0) {
        throw new NotFoundError(`No work items found with IDs: ${ids.join(', ')}`);
      }

      return workItems;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        `Failed to get work item(s): ${error instanceof Error ? error.message : String(error)}`,
        error?.statusCode
      );
    }
  };
}