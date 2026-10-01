export const ROUTES = {
  HOME: '/',
  GAME: '/play',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const getLocalizedPath = (path: string, locale: string): string => {
  if (locale === 'en') return path;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
};
