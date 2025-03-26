import { getWorkItemTrackingApi } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { ApiError } from '../../errors.js';

export function listWorkItems(config: AzureDevOpsConfig) {
  return async (args: any) => {
    try {
      const { query } = args;

      if (!query) {
        throw new Error('A WIQL query must be provided');
      }

      const witApi = await getWorkItemTrackingApi(config);
      
      // Execute the WIQL query to get work item references
      const queryResult = await witApi.queryByWiql({ query }, { project: config.project });
      
      if (!queryResult || !queryResult.workItems || queryResult.workItems.length === 0) {
        return { count: 0, workItems: [] };
      }

      // Extract the IDs from the work item references
      const ids = queryResult.workItems.map(item => item.id);
      
      // Get the actual work items with all fields
      const workItems = await witApi.getWorkItems(ids);

      return {
        count: workItems.length,
        workItems: workItems
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        `Failed to list work items: ${error instanceof Error ? error.message : String(error)}`,
        error?.statusCode
      );
    }
  };
}