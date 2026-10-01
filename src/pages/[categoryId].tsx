import type { GetServerSideProps } from 'next';
import { MainLayout } from '@/layouts/MainLayout';
import { HomeView } from '@/view/home/HomeView';
import { getVideoCategory } from '@/api/videoCategories';
import { isVideoCategoryId, VideoCategory } from '@/model/video_category';

type Props = { category: VideoCategory | null; error: boolean };

export default function CategoryPage({ category, error }: Props) {
  return (
    <MainLayout>
      {error || !category ? (
        <div role="alert" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center text-white">
          <p>Unable to load videos. Please try again.</p>
          <button className="rounded-full bg-fuchsia-600 px-6 py-3" onClick={() => window.location.reload()}>Try again</button>
        </div>
      ) : category.videos.length === 0 ? (
        <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center text-white">
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <p>No videos available in this category yet.</p>
          <a className="rounded-full bg-fuchsia-600 px-6 py-3" href="/">Back to home</a>
        </div>
      ) : <HomeView key={category.id} previews={category.videos.slice(0, 3)} />}
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, res }) => {
  const categoryId = params?.categoryId;
  if (!isVideoCategoryId(categoryId)) return { notFound: true };
  res.setHeader('Cache-Control', 'no-store');
  try {
    const category = await getVideoCategory(categoryId);
    if (!category) return { notFound: true };
    return { props: { category, error: false } };
  } catch {
    res.statusCode = 502;
    return { props: { category: null, error: true } };
  }
};
