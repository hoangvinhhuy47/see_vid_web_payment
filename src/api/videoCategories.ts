// Server-only: Redis credentials must never enter the browser bundle.
import { withVideoRedis } from './redis';
import { isVideoCategoryId, VideoCategory } from '@/model/video_category';

const DATA_URL = 'https://aistudio.picify.net/data/home.videoai.json';
const VIDEO_URL = 'https://aistudio.picify.net/images';
const cacheKey = (categoryId: string) => `seevid:video-effects:v2:${categoryId}`;

type SourceCategory = { c?: unknown; n?: unknown; ct?: unknown; ts?: unknown };
type SourceVideo = { id?: unknown; model?: unknown; title?: unknown };

export function parseVideoCategories(payload: unknown): VideoCategory[] {
  const categories = (payload as { homeData?: { cg?: unknown } } | null)?.homeData?.cg;
  if (!Array.isArray(categories)) throw new Error('Invalid video category response');

  return categories.filter((item): item is SourceCategory & { c: string } =>
    !!item && item.ct === 'video_effects' && isVideoCategoryId(item.c),
  ).map((category) => {
    const seen = new Set<string>();
    if (!Array.isArray(category.ts)) throw new Error('Invalid category video list');
    const videos = category.ts.flatMap((video: SourceVideo) => {
      if (!video || typeof video !== 'object') return [];
      const modelId = typeof video.model === 'string' ? video.model.match(/^(\d+)\.mp4$/)?.[1] : undefined;
      const id = modelId ?? String(video.id ?? '');
      if (!/^\d+$/.test(id) || seen.has(id)) return [];
      seen.add(id);
      return [{
        id,
        caption: typeof video.title === 'string' ? video.title : 'Create your video with AI.',
        videoUrl: `${VIDEO_URL}/${id}/thumb_450x800/${id}.mp4`,
      }];
    });
    return {
      id: category.c,
      name: typeof category.n === 'string' ? category.n : category.c,
      videos,
    };
  });
}

function isCachedCategory(value: unknown, categoryId: string): value is VideoCategory {
  const category = value as VideoCategory | null;
  return !!category && category.id === categoryId
    && typeof category.name === 'string' && Array.isArray(category.videos)
    && category.videos.every((video) => video && /^\d+$/.test(video.id)
      && typeof video.caption === 'string'
      && video.videoUrl === `${VIDEO_URL}/${video.id}/thumb_450x800/${video.id}.mp4`);
}

let pendingRefresh: Promise<VideoCategory[]> | undefined;

async function refreshCategories(): Promise<VideoCategory[]> {
  if (pendingRefresh) return pendingRefresh;
  pendingRefresh = (async () => {
    const response = await fetch(DATA_URL, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    if (!response.ok) throw new Error(`Video source returned ${response.status}`);
    const categories = parseVideoCategories(await response.json());
    const configuredTtl = Number(process.env.VIDEO_CACHE_TTL_SECONDS ?? 300);
    const ttl = Number.isSafeInteger(configuredTtl) && configuredTtl > 0 ? configuredTtl : 300;
    await withVideoRedis(async (client) => {
      const transaction = client.multi();
      for (const category of categories) {
        transaction.set(cacheKey(category.id), JSON.stringify(category), { EX: ttl });
      }
      return transaction.exec();
    });
    return categories;
  })().finally(() => { pendingRefresh = undefined; });
  return pendingRefresh;
}

export async function getVideoCategory(categoryId: string): Promise<VideoCategory | null> {
  if (!isVideoCategoryId(categoryId)) return null;
  const cached = await withVideoRedis((client) => client.get(cacheKey(categoryId)));
  if (cached) {
    try {
      const parsed: unknown = JSON.parse(cached);
      if (isCachedCategory(parsed, categoryId)) return parsed;
    } catch { /* Replace malformed cache entries from the source. */ }
  }
  const categories = await refreshCategories();
  return categories.find((category) => category.id === categoryId) ?? null;
}
