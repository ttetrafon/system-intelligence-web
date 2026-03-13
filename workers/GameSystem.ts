import { cacheRequestData, invalidateCache } from "util/cache";
import { defaultGameSystemDataObj, type BlockDocument, type GameSystemData } from "@app-types/game";
import type {
  addBlockToDocumentCommand,
  removeBlockFromDocument,
  reorderBlocksInDocument,
  UpdateBody,
  updateBlockInDocument,
} from "@app-types/requests";
import {
  addBlockToDocument,
  removeBlockFromDocument as removeBlockFromDoc,
  reorderBlocksInDocument as reorderBlocksInDoc,
  updateBlockInDocument as updateBlockInDoc,
} from "util/data";

const CACHE_KEY = new Request('https://cache.internal/game-system');

export async function clearCategoriesCache() {
  await invalidateCache(CACHE_KEY);
}

export async function getGameSystem(_db: D1Database, r2: R2Bucket, environment?: string, _system?: string, _timestamp?: number): Promise<Response> {
  const useCache = environment !== 'development';
  return collectGameSystemData(r2, useCache);
}

export async function collectGameSystemData(r2: R2Bucket, useCache = true): Promise<Response> {
  if (useCache) {
    const cache = (caches as unknown as { default: Cache }).default;
    const cached = await cache.match(CACHE_KEY);
    if (cached) return cached.clone();
  }

  const coreObject = await r2.get('game-system/si/core.json');
  let core: GameSystemData['core'];
  if (coreObject) {
    core = await coreObject.json<GameSystemData['core']>();
  } else {
    core = defaultGameSystemDataObj.core;
    await r2.put('game-system/si/core.json', JSON.stringify(core), {
      httpMetadata: { contentType: 'application/json' },
    });
  }

  const charactersObject = await r2.get('game-system/si/characters.json');
  let characters: GameSystemData['characters'];
  if (charactersObject) {
    characters = await charactersObject.json<GameSystemData['characters']>();
  } else {
    characters = defaultGameSystemDataObj.characters;
    await r2.put('game-system/si/characters.json', JSON.stringify(characters), {
      httpMetadata: { contentType: 'application/json' },
    });
  }

  const gameSystemData: GameSystemData = {
    core,
    characters,
    adventuring: {},
    equipment: {},
    last_updated: Date.now(),
  };

  const json = JSON.stringify(gameSystemData);
  if (useCache) await cacheRequestData(CACHE_KEY, json);

  return Response.json(gameSystemData);
}

export async function updateGameSystemData(r2: R2Bucket, system: string, body: unknown, _environment?: string): Promise<Response> {
  const { dataPath, dataProperty, data } = body as UpdateBody;

  const key = `game-system/${system}/${dataPath}`;
  const object = await r2.get(key);
  const fileData: Record<string, unknown> = object ? await object.json<Record<string, unknown>>() : {};

  const doc = (fileData[dataProperty] ?? { order: [], blocks: {} }) as BlockDocument;

  for (const cmd of data) {
    if ('block' in cmd) {
      const c = cmd as addBlockToDocumentCommand;
      addBlockToDocument(doc, c.block, c.position);
    } else if ('blockId' in cmd) {
      removeBlockFromDoc(doc, (cmd as removeBlockFromDocument).blockId);
    } else if ('updatedOrder' in cmd) {
      reorderBlocksInDoc(doc, (cmd as reorderBlocksInDocument).updatedOrder);
    } else if ('updatedBlock' in cmd) {
      updateBlockInDoc(doc, (cmd as updateBlockInDocument).updatedBlock);
    }
  }

  fileData[dataProperty] = doc;

  await r2.put(key, JSON.stringify(fileData), {
    httpMetadata: { contentType: 'application/json' },
  });

  await invalidateCache(CACHE_KEY);

  return Response.json({ success: true });
}
