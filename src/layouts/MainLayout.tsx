import React from "react";
import Head from "next/head";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTranslation } from "@/utils/i18n";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const { t } = useTranslation();
  const pageTitle = title
    ? `${title} | ${t("app.title", "SeeVid")}`
    : `${t("app.title", "SeeVid")} - ${t("app.tagline", "Swap & Match")}`;

  const metaDesc =
    description ||
    t(
      "app.tagline",
      "Create unique and engaging videos with the power of AI. Turn your ideas and images into creative videos quickly and easily.",
    );

  return (
    <div
      className="
    flex flex-col
    bg-black
        bg-[radial-gradient(circle_at_50%_0%,rgba(164,79,232,0.18)_0%,transparent_45%),radial-gradient(circle_at_50%_100%,rgba(38,0,255,0.16)_0%,transparent_45%)]
    text-slate-100
    relative
    overflow-x-hidden
  "
    >
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col w-full max-w-[430px] mx-auto h-full">
        {children}
      </main>
    </div>
  );
};
