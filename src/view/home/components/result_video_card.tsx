interface ResultVideoCardProps {
  videoUrl?: string;
}

export default function ResultVideoCard({
  videoUrl = "https://aistudio.picify.net/images/290006/thumb_450x800/290006.mp4",
}: ResultVideoCardProps) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
      {/* Video */}
      <video
        className="block w-full object-contain"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Overlay */}
      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          bg-[#05040740]
          backdrop-blur-md
          px-5
        "
      >
        <img
          src="/icons/ic_lock.png"
          alt="Logo"
          className="h-[48px] w-auto shrink-0 object-contain mb-4"
        />
        <h2 className="text-center text-[14px] font-bold tracking-tight text-white">
          YOUR RESULT IS READY
        </h2>

        <p className="mt-2 text-center text-[21px]  text-[#FDF400]">
          Create without limits
        </p>
      </div>
    </div>
  );
}
