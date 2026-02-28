import { invalidateCache } from "util/cache";

const CACHE_KEY = new Request('https://cache.internal/game-system');

export async function clearCategoriesCache() {
  await invalidateCache(CACHE_KEY);
}

export async function getGameSystem(db: D1Database, environment?: string, _system?: string, _timestamp?: number): Promise<Response> {
  const useCache = environment !== 'development';
  const data = await collectGameSystemData(db, useCache);
  return Response.json({});
}

export async function collectGameSystemData(db: D1Database, useCache = true): Promise<Response> {

  return Response.json({});
}
