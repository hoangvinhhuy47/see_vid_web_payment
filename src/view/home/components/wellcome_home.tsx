export default function WelcomeView({
  onContinue,
}: {
  onContinue?: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      {/* Content */}
      {/* Video */}
      <div className="flex w-full flex-1 items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-2xl border border-white">
          <video
            className="mx-auto block max-h-full w-full object-contain"
            src="https://aistudio.picify.net/images/290006/thumb_450x800/290006.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <div
            className="
        absolute
        bottom-0
        left-0
        w-full
        px-4
        pt-12
        pb-4
        bg-[linear-gradient(180deg,rgba(5,4,7,0)_0%,#050407_89.5%)]
      "
          >
            <p className="text-center text-white">Your text here</p>
          </div>
        </div>
      </div>

      {/* Continue */}
      <button
        type="button"
        className="
        mt-[20px] bg-[linear-gradient(92.95deg,_#4A04D1_-22.72%,_#D434E0_28.24%,_#F6AFBB_104.92%)]
        w-full shrink-0 rounded-[150px] py-[10px] font-semibold text-white transition  hover:scale-[1.02]"
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  );
}
