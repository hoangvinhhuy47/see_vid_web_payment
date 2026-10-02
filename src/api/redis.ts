// Server-only: import this module from API routes or getServerSideProps.
import { createClient } from 'redis';

const makeClient = () => createClient({
  url: process.env.REDIS_URL,
  socket: { connectTimeout: 2000, reconnectStrategy: false },
  disableOfflineQueue: true,
});
type Client = ReturnType<typeof makeClient>;
const state = globalThis as typeof globalThis & {
  videoRedis?: Client;
  videoRedisConnection?: Promise<Client>;
};

async function getClient(): Promise<Client | null> {
  if (!process.env.REDIS_URL) return null;
  if (state.videoRedis?.isReady) return state.videoRedis;
  if (state.videoRedisConnection) return state.videoRedisConnection;

  const client = makeClient();
  // Do not log connection URLs, which may contain credentials.
  client.on('error', () => console.warn('Video Redis connection unavailable'));
  state.videoRedis = client;
  const connection = client.connect().then(() => client).finally(() => {
    state.videoRedisConnection = undefined;
  });
  state.videoRedisConnection = connection;
  return connection;
}

export async function withVideoRedis<T>(operation: (client: Client) => Promise<T>): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const client = await getClient();
        return client ? operation(client) : null;
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Redis timeout')), 2500);
      }),
    ]);
  } catch {
    if (state.videoRedis?.isOpen) state.videoRedis.destroy();
    console.warn('Video cache unavailable; using the source endpoint');
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
