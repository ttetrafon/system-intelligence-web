import { cacheRequestData, invalidateCache } from "util/cache";
import { defaultGameSystemData, type BlockDocument, type GameSystemData, type MoralityPairs } from "@app-types/game";

/** Maps a dataKey (dot-notation) to the R2 object key */
export function r2Key(system: string, dataKey: string): string {
  return `game-system/${system}/${dataKey.replace(/\./g, '/')}.json`;
}

/** Cache key per R2 document */
function cacheKeyFor(r2Path: string): Request {
  return new Request(`https://cache.internal/${r2Path}`);
}

/**
 * Read a single R2 document with optional CF Cache API caching.
 * Returns the parsed value, or the default if the key doesn't exist yet.
 */
async function readDocument<T>(
  r2: R2Bucket,
  r2Path: string,
  defaultValue: T,
  useCache: boolean,
): Promise<T> {
  const key = cacheKeyFor(r2Path);

  if (useCache) {
    const cache = (caches as unknown as { default: Cache }).default;
    const cached = await cache.match(key);
    if (cached) return cached.json<T>();
  }

  const object = await r2.get(r2Path);
  if (object) {
    const value = await object.json<T>();
    if (useCache) await cacheRequestData(key, JSON.stringify(value));
    return value;
  }

  // Key doesn't exist — write the default and cache it
  await r2.put(r2Path, JSON.stringify(defaultValue), {
    httpMetadata: { contentType: 'application/json' },
  });
  if (useCache) await cacheRequestData(key, JSON.stringify(defaultValue));
  return defaultValue;
}

export async function getGameSystem(_db: D1Database, r2: R2Bucket, environment?: string): Promise<Response> {
  const useCache = environment !== 'development';
  return collectGameSystemData(r2, useCache);
}

export async function collectGameSystemData(r2: R2Bucket, useCache: boolean): Promise<Response> {
  const defaults = defaultGameSystemData();

  // Read the three active documents in parallel
  const [checksDoc, moralityDoc, moralityPairs] = await Promise.all([
    readDocument<BlockDocument>(r2, r2Key('si', 'core.checks.document'), defaults.core.checks.document, useCache),
    readDocument<BlockDocument>(r2, r2Key('si', 'characters.morality.document'), defaults.characters.morality.document, useCache),
    readDocument<MoralityPairs>(r2, r2Key('si', 'characters.morality.pairs'), defaults.characters.morality.pairs, useCache),
  ]);

  const gameSystemData: GameSystemData = {
    ...defaults,
    core: {
      ...defaults.core,
      checks: { document: checksDoc },
    },
    characters: {
      ...defaults.characters,
      morality: { document: moralityDoc, pairs: moralityPairs },
    },
  };

  return Response.json(gameSystemData);
}

/**
 * Invalidate the cache for a specific dataKey.
 */
export async function invalidateDocumentCache(system: string, dataKey: string): Promise<void> {
  await invalidateCache(cacheKeyFor(r2Key(system, dataKey)));
}
