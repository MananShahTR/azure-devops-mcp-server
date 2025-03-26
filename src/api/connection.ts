import * as azdev from 'azure-devops-node-api';
import { AuthenticationError } from '../errors.js';
import { AzureDevOpsConfig } from '../config/environment.js';

export async function getConnection(config: AzureDevOpsConfig) {
  try {
    const authHandler = azdev.getPersonalAccessTokenHandler(config.pat);
    const connection = new azdev.WebApi(config.orgUrl, authHandler);
    await connection.connect();  // Test the connection
    return connection;
  } catch (error) {
    throw new AuthenticationError('Failed to connect to Azure DevOps: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function getWorkItemTrackingApi(config: AzureDevOpsConfig) {
  const connection = await getConnection(config);
  return await connection.getWorkItemTrackingApi();
}

export async function getCoreApi(config: AzureDevOpsConfig) {
  const connection = await getConnection(config);
  return await connection.getCoreApi();
}

export async function getBuildApi(config: AzureDevOpsConfig) {
  const connection = await getConnection(config);
  return await connection.getBuildApi();
}

export async function getWikiApi(config: AzureDevOpsConfig) {
  const connection = await getConnection(config);
  return await connection.getWikiApi();
}

export async function getGitApi(config: AzureDevOpsConfig) {
  const connection = await getConnection(config);
  return await connection.getGitApi();
}