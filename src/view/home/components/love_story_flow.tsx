"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import LoveStoryVideoPreview from "./love_story_video_preview";

const previews = [
  { id: "290025", caption: "Turn your love into unforgettable moments." },
  { id: "290006", caption: "Create your dream couple video with AI." },
  {
    id: "290023",
    caption: "Upload one photo to create your romantic love story.",
  },
];
const recipients = [
  "Me & My Partner",
  "My Crush",
  "My Husband / Wife",
  "Someone Special",
  "Surprise Me",
];
// Keep the option order and wording from the supplied mockup.
const moods = [
  "Romantic & Sweet",
  "Cute & Playful",
  "Surprise Me",
  "Cute & Playful",
  "Surprise Me",
];

export interface LoveStoryAnswers {
  recipient: string;
  message: string;
  mood: string;
}

interface LoveStoryFlowProps {
  onComplete: (answers: LoveStoryAnswers) => void;
}

enum LoveStoryStep {
  FirstVideo = 0,
  SecondVideo = 1,
  ThirdVideo = 2,
  Recipient = 3,
  Message = 4,
  Mood = 5,
}

export default function LoveStoryFlow({
  onComplete,
}: LoveStoryFlowProps) {
  const [step, setStep] = useState<LoveStoryStep>(LoveStoryStep.FirstVideo);
  const [recipient, setRecipient] = useState(0);
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isPreview = step < previews.length;
  const options = step === LoveStoryStep.Recipient ? recipients : moods;
  const selected = step === LoveStoryStep.Recipient ? recipient : mood;

  const handleContinue = () => {
    if (step === LoveStoryStep.Mood) {
      onComplete({
        recipient: recipients[recipient],
        message: message.trim(),
        mood: moods[mood],
      });
    } else {
      setStep(step + 1);
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  };

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col bg-[radial-gradient(ellipse_at_top,rgba(83,25,153,0.24),transparent_45%)] px-4 pb-[max(26px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] text-white">
      <header className="flex shrink-0 justify-center pb-[clamp(20px,3dvh,30px)]">
        <img
          src="/images/img_logo.png"
          alt="SeeVid"
          className="h-[34px] w-auto object-contain"
        />
      </header>
      <section
        aria-label={`Step ${step + 1} of 6`}
        className="flex min-h-0 flex-1 flex-col"
      >
        {isPreview ? (
          <LoveStoryVideoPreview index={step} previews={previews} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="mb-[clamp(24px,5dvh,48px)] mt-2 text-center text-[clamp(20px,2.7dvh,24px)] font-semibold leading-tight outline-none"
            >
              {step === LoveStoryStep.Recipient
                ? "Who is this love video for?"
                : step === LoveStoryStep.Message
                  ? "What would you like to say to your special someone?"
                  : "How do you want your love story to feel?"}
            </h1>
            {step === LoveStoryStep.Message ? (
              <div>
                <label
                  htmlFor="love-message"
                  className="mb-6 block text-sm text-[#c6bdcc]"
                >
                  e.g. You make every moment magical.
                </label>
                <input
                  id="love-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Your message (optional)"
                  maxLength={500}
                  className="w-full rounded-xl border border-transparent bg-[#494949] px-4 py-3 text-base text-white placeholder:text-[#c7c2c7] focus:border-fuchsia-400 focus:outline-none"
                />
              </div>
            ) : (
              <div
                role="group"
                aria-label={step === LoveStoryStep.Recipient ? "Choose recipient" : "Choose mood"}
                className="flex flex-col gap-[clamp(12px,2.4dvh,20px)]"
              >
                {options.map((option, index) => (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    aria-pressed={selected === index}
                    onClick={() =>
                      step === LoveStoryStep.Recipient ? setRecipient(index) : setMood(index)
                    }
                    className={`relative min-h-11 w-full rounded-full border px-10 py-2 text-center text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${selected === index ? "border-white bg-[#d532d2] ring-1 ring-white" : "border-fuchsia-400 bg-[#241522] hover:bg-[#392039]"}`}
                  >
                    {selected === index && (
                      <span className="absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white">
                        <Check
                          className="h-5 w-5 text-[#d532d2]"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={handleContinue}
          className="mt-4 min-h-[45px] w-full shrink-0 rounded-full bg-gradient-to-r from-[#a20ed1] via-[#db39d1] to-[#eca4c7] px-2 py-2 text-lg font-semibold text-white transition brightness-100 hover:brightness-110 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          CONTINUE
        </button>
      </section>
    </div>
  );
}
