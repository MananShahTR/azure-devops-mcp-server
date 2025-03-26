import { getWikiApi } from './connection.js';
import { AzureDevOpsConfig } from '../config/environment.js';
import { ApiError, WikiNotFoundError, WikiPageNotFoundError } from '../errors.js';
import { WikiType } from 'azure-devops-node-api/interfaces/WikiInterfaces.js';

export async function getWikis(config: AzureDevOpsConfig, projectId?: string) {
  try {
    const wikiApi = await getWikiApi(config);
    return await wikiApi.getAllWikis(projectId || config.project);
  } catch (error) {
    throw new ApiError(
      `Failed to get wikis: ${error instanceof Error ? error.message : String(error)}`,
      error?.statusCode,
      error
    );
  }
}

export async function getWikiPageContent(config: AzureDevOpsConfig, wikiIdentifier: string, path: string, recursionLevel = 0, version?: string) {
  try {
    const wikiApi = await getWikiApi(config);
    const pageContent = await wikiApi.getPageContent(
      wikiIdentifier,
      path,
      config.project,
      version || 'main',
      recursionLevel
    );
    return pageContent;
  } catch (error: any) {
    // Check for specific error codes
    if (error.statusCode === 404) {
      if (error.body && error.body.includes('Wiki not found')) {
        throw new WikiNotFoundError(wikiIdentifier);
      } else {
        throw new WikiPageNotFoundError(wikiIdentifier, path);
      }
    }
    
    throw new ApiError(
      `Failed to get wiki page content: ${error instanceof Error ? error.message : String(error)}`,
      error?.statusCode,
      error
    );
  }
}

export async function getWikiPage(config: AzureDevOpsConfig, wikiIdentifier: string, path: string, recursionLevel = 0, version?: string, includeContent = true) {
  try {
    const wikiApi = await getWikiApi(config);
    const page = await wikiApi.getPage(
      wikiIdentifier,
      path,
      config.project,
      version || 'main',
      recursionLevel,
      includeContent
    );
    return page;
  } catch (error: any) {
    // Check for specific error codes
    if (error.statusCode === 404) {
      if (error.body && error.body.includes('Wiki not found')) {
        throw new WikiNotFoundError(wikiIdentifier);
      } else {
        throw new WikiPageNotFoundError(wikiIdentifier, path);
      }
    }
    
    throw new ApiError(
      `Failed to get wiki page: ${error instanceof Error ? error.message : String(error)}`,
      error?.statusCode,
      error
    );
  }
}

export async function createWiki(config: AzureDevOpsConfig, name: string, projectId?: string, mappedPath = '/') {
  try {
    const wikiApi = await getWikiApi(config);
    return await wikiApi.createWiki({
      name,
      projectId: projectId || config.project,
      type: WikiType.ProjectWiki,
      mappedPath,
    });
  } catch (error) {
    throw new ApiError(
      `Failed to create wiki: ${error instanceof Error ? error.message : String(error)}`,
      error?.statusCode,
      error
    );
  }
}

export async function updateWikiPage(config: AzureDevOpsConfig, wikiIdentifier: string, path: string, content: string, version?: string, comment?: string) {
  try {
    const wikiApi = await getWikiApi(config);
    const page = await wikiApi.createOrUpdatePage({
      content,
      version: version || 'main',
      comment,
    }, wikiIdentifier, path, config.project);
    return page;
  } catch (error: any) {
    // Check for specific error codes
    if (error.statusCode === 404 && error.body && error.body.includes('Wiki not found')) {
      throw new WikiNotFoundError(wikiIdentifier);
    }
    
    throw new ApiError(
      `Failed to update wiki page: ${error instanceof Error ? error.message : String(error)}`,
      error?.statusCode,
      error
    );
  }
}