import React, { useState } from "react";
import WelcomeView from "./components/wellcome_home";
import WhoIsThisForView from "./components/create_video_for";
import UploadPhotoView from "./components/upload_photo";
import GeneratingVideoView from "./components/createing_video";
import EmailView from "./components/input_email_create_video";
import ShopSection from "@/components/stripe/ShopSection";

enum CreateVideoStep {
  Welcome = 1,
  WhoIsThisFor = 2,
  UploadPhoto = 3,
  Generating = 4,
  Email = 5,
  Shop = 6,
}

export const HomeView: React.FC = () => {
  const [step, setStep] = useState<CreateVideoStep>(CreateVideoStep.Welcome);

  const [email, setEmail] = useState("");

  const renderStep = () => {
    switch (step) {
      case CreateVideoStep.Welcome:
        return (
          <WelcomeView
            onContinue={() => {
              setStep(CreateVideoStep.WhoIsThisFor);
            }}
          />
        );

      case CreateVideoStep.WhoIsThisFor:
        return (
          <WhoIsThisForView
            onContinue={() => {
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

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center pt-[20px]">
      <img
        src="/images/img_logo.png"
        alt="Logo"
        className="h-[30px]"
      />
      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 pt-[20px]">
        {renderStep()}
      </div>
    </div>
  );
};
