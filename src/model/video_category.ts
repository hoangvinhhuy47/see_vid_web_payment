export interface VideoPreview {
  id: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  videos: VideoPreview[];
}

export function isVideoCategoryId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}
