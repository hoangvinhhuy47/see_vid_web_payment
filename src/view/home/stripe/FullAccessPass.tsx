import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function FullAccessPass() {
  const listAcess = [
    "Ultra-realistic HD",
    "Unlimited Al Photos",
    "Unlock Al Videos",
    "Access to All Styles",
  ];
  const fakeComments = [
    {
      name: "Sophia M.",
      rating: 5,
      comment:
        "The AI video quality is incredible! The motion looks so natural and realistic.",
    },
    {
      name: "James R.",
      rating: 5,
      comment:
        "Honestly one of the easiest AI video generators I've tried. The results are amazing.",
    },
    {
      name: "Emma W.",
      rating: 5,
      comment:
        "I love how smooth the generated videos are. The details and lighting look fantastic!",
    },
    {
      name: "Daniel K.",
      rating: 5,
      comment:
        "The video generation is super impressive. I got a great result from just one prompt.",
    },
    {
      name: "Olivia T.",
      rating: 5,
      comment:
        "This is seriously fun to use. The AI understands the prompt really well.",
    },
    {
      name: "Lucas B.",
      rating: 5,
      comment:
        "The quality is much better than I expected. Definitely impressed with the AI videos.",
    },
    {
      name: "Ava H.",
      rating: 5,
      comment:
        "The animations look incredibly smooth and the final video feels professionally made.",
    },
    {
      name: "Noah S.",
      rating: 5,
      comment:
        "I've tried several AI video tools and this one gives me some of the best results.",
    },
    {
      name: "Mia P.",
      rating: 5,
      comment:
        "The generated videos look amazing on social media. Really happy with the quality!",
    },
  ];
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % fakeComments.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const visibleComments = Array.from({ length: 3 }, (_, index) => {
    return fakeComments[(startIndex + index) % fakeComments.length];
  });
  return (
    <div className="w-full flex flex-col items-center mt-5">
      <div className="text-white text-[21px] font-bold uppercase flex gap-2 items-center justify-center">
        <img
          src="/icons/ic_star.png"
          alt="Logo"
          className="h-[21px] w-auto shrink-0 object-contain"
        />
        Your Full Access Pass
      </div>
      <div className="flex flex-col gap-2 mt-5">
        {listAcess.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-[18px] text-white"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[18px] font-bold text-white">
              ✓
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <img
        src="/icons/ic_sheild.png"
        alt="Logo"
        className="h-[32px] w-auto shrink-0 object-contain my-5"
      />
      <span className="flex items-center justify-center rounded-full text-[21px] font-bold text-white w-full">
        14-Day Money-Back Guarantee
      </span>
      <span className="flex items-center justify-center rounded-full text-[13px]  text-[#C4C4C4] w-full my-5 text-center">
        We're here to help you reach your goals a by that. If you don't see real
        results wi we'll give you a full refund. You can cancel your
        subscription anytime app settings.
      </span>
      <span className="flex items-center justify-center rounded-full text-[21px] font-bold text-white w-full text-center">
        Not just a single photo - get 50+ templates included
      </span>
      <div className="relative  w-full overflow-hidden rounded-2xl border border-white my-5">
        <video
          className="mx-auto block max-h-full w-full object-contain"
          src="https://aistudio.picify.net/images/290006/thumb_450x800/290006.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
      <div className="text-white text-[18px] font-bold uppercase flex gap-2 items-center justify-center">
        Loved by Millions of Happy Users
        <img
          src="/icons/ic_hand.png"
          alt="ic_hand"
          className="h-[15px] w-auto shrink-0 object-contain"
        />
      </div>
      {/* Comment */}
      <div className="flex flex-col gap-3 my-5">
        {visibleComments.map((item, index) => (
          <div
            key={`${item.name}-${startIndex}-${index}`}
            className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm duration-500"
          >
            {/* Name */}
            <div className="mb-1 font-semibold text-slate-900">{item.name}</div>

            {/* Stars */}
            <div className="mb-2 flex items-center gap-0.5">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Comment */}
            <p className="text-sm leading-relaxed text-slate-600">
              {item.comment}
            </p>
          </div>
        ))}
      </div>
      {/* term */}
      <div className="text-white text-[21px] font-bold uppercase flex gap-4 items-center justify-center">
        <img
          src="/images/img_logo.png"
          alt="Logo"
          className="h-[25px] w-auto shrink-0 object-contain"
        />
        <img
          src="/icons/ic_hand_love.png"
          alt="Logo"
          className="h-[25px] w-auto shrink-0 object-contain"
        />
      </div>
      <div className="flex gap-4 items-center justify-center my-5">
        <div className="flex flex-row items-center justify-center gap-4">
          <a
            href="https://your-domain.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#D9D9D9] underline underline-offset-2 hover:opacity-80"
          >
            Terms of Service
          </a>

          <a
            href="https://your-domain.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#D9D9D9] underline underline-offset-2 hover:opacity-80"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
