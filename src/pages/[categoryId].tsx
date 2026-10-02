import type { GetServerSideProps } from "next";
import Head from "next/head";
import { MainLayout } from "@/layouts/MainLayout";
import { HomeView } from "@/view/home/HomeView";
import { getVideoCategory } from "@/api/videoCategories";
import { isVideoCategoryId, VideoCategory } from "@/model/video_category";

export const TITLE = "SeeVid: AI Video Generator";
export const DESCRIPTION =
  "Biến những bức ảnh của bạn thành những video biến hình tuyệt vời chỉ với một chạm. Tạo chân dung AI và khám phá các phong cách hình ảnh sáng tạo với SeeVid.";

type Props = {
  category: VideoCategory | null;
  error: boolean;
  shareUrl: string;
};

export default function CategoryPage({ category, error, shareUrl }: Props) {
  const preview = category?.videos[0];
  const videoUrl = preview?.videoUrl;
  const imageUrl =
    preview?.thumbnailUrl ??
    new URL("/images/img_logo.png", shareUrl).toString();
  return (
    <MainLayout>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} key="description" />
        <link rel="canonical" href={shareUrl} key="canonical" />
        <meta property="og:title" content={TITLE} key="og:title" />
        <meta
          property="og:description"
          content={DESCRIPTION}
          key="og:description"
        />
        <meta
          property="og:type"
          content={videoUrl ? "video.other" : "website"}
          key="og:type"
        />
        <meta
          property="og:site_name"
          content="Seevid: AI Video Generator"
          key="og:site_name"
        />
        <meta property="og:url" content={shareUrl} key="og:url" />
        <meta property="og:image" content={imageUrl} key="og:image" />
        <meta
          property="og:image:alt"
          content={preview?.caption ?? TITLE}
          key="og:image:alt"
        />
        {videoUrl && (
          <>
            <meta property="og:video" content={videoUrl} key="og:video" />
            <meta
              property="og:video:secure_url"
              content={videoUrl}
              key="og:video:secure_url"
            />
            <meta
              property="og:video:type"
              content="video/mp4"
              key="og:video:type"
            />
            <meta
              property="og:video:width"
              content="450"
              key="og:video:width"
            />
            <meta
              property="og:video:height"
              content="800"
              key="og:video:height"
            />
          </>
        )}
      </Head>
      {error || !category ? (
        <div
          role="alert"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center text-white"
        >
          <p>Unable to load videos. Please try again.</p>
          <button
            className="rounded-full bg-fuchsia-600 px-6 py-3"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      ) : category.videos.length === 0 ? (
        <div
          role="status"
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center text-white"
        >
          <h1 className="text-2xl font-semibold">{category.name}</h1>
          <p>No videos available in this category yet.</p>
          <a className="rounded-full bg-fuchsia-600 px-6 py-3" href="/">
            Back to home
          </a>
        </div>
      ) : (
        <HomeView key={category.id} previews={category.videos.slice(0, 3)} />
      )}
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  req,
  res,
  locale,
  defaultLocale,
}) => {
  const categoryId = params?.categoryId;
  if (!isVideoCategoryId(categoryId)) return { notFound: true };
  // Set NEXT_PUBLIC_APP_URL to the public HTTPS domain in production.
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)
      ?.split(",")[0]
      .trim() === "https"
      ? "https"
      : "http";
  const origin =
    process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${req.headers.host}`;
  const localePrefix = locale && locale !== defaultLocale ? `/${locale}` : "";
  const shareUrl = new URL(
    `${localePrefix}/${encodeURIComponent(categoryId)}`,
    origin,
  ).toString();
  res.setHeader("Cache-Control", "no-store");
  try {
    const category = await getVideoCategory(categoryId);
    if (!category) return { notFound: true };
    return { props: { category, error: false, shareUrl } };
  } catch {
    res.statusCode = 502;
    return { props: { category: null, error: true, shareUrl } };
  }
};
