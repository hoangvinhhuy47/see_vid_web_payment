import React, { useState } from "react";
import LoveStoryFlow, {
  type LoveStoryAnswers,
} from "./components/love_story_flow";
import UploadPhotoView from "./components/upload_photo";
import GeneratingVideoView from "./components/creating_video";
import EmailView from "./components/input_email_create_video";
import ShopSection from "@/view/home/stripe/ShopSection";
import type { VideoPreview } from "@/model/video_category";

enum CreateVideoStep {
  Welcome = 1,
  UploadPhoto = 3,
  Generating = 4,
  Email = 5,
  Shop = 6,
}

export const HomeView: React.FC<{ previews?: VideoPreview[] }> = ({ previews }) => {
  const [step, setStep] = useState<CreateVideoStep>(CreateVideoStep.Welcome);

  const [email, setEmail] = useState("");
  const [, setStoryAnswers] = useState<LoveStoryAnswers | null>(null);

  const renderStep = () => {
    switch (step) {
      case CreateVideoStep.Welcome:
        return (
          <LoveStoryFlow
            previews={previews}
            onComplete={(answers) => {
              setStoryAnswers(answers);
              setStep(CreateVideoStep.UploadPhoto);
            }}
          />
        );

      case CreateVideoStep.UploadPhoto:
        return (
          <UploadPhotoView
            onContinue={() => {
              setStep(CreateVideoStep.Generating);
            }}
          />
        );

      case CreateVideoStep.Generating:
        return (
          <GeneratingVideoView
            onComplete={() => {
              setStep(CreateVideoStep.Email);
            }}
          />
        );

      case CreateVideoStep.Email:
        return (
          <EmailView
            onComplete={(value) => {
              setEmail(value);
              setStep(CreateVideoStep.Shop);
            }}
          />
        );

      case CreateVideoStep.Shop:
        return <ShopSection email={email} />;

      default:
        return null;
    }
  };

  if (step === CreateVideoStep.Welcome) {
    return renderStep();
  }

  return (
    <div
      className={`flex flex-col items-center justify-start py-6 ${
        step === CreateVideoStep.Generating || step === CreateVideoStep.UploadPhoto || step === CreateVideoStep.Email
          ? "h-dvh overflow-hidden "
          : ""
      }`}
    >
      {step !== CreateVideoStep.Generating &&
        step !== CreateVideoStep.UploadPhoto && (
          <img
            src="/images/img_logo.png"
            alt="Logo"
            className="h-[32px] w-auto shrink-0 object-contain mb-4"
          />
        )}

      <div
        className={`flex w-full flex-col items-center justify-start px-4 ${
          step === CreateVideoStep.Generating || step === CreateVideoStep.UploadPhoto || step === CreateVideoStep.Email
            ? "min-h-0 flex-1"
            : ""
        }`}
      >
        {renderStep()} 
      </div>
    </div>
  );
};
