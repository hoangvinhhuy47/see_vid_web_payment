"use client";

import UploadArea from "./upload_area";
import { useState } from "react";

export default function UploadPhotoView({
  onContinue,
  isTwoPhotos = true,
}: {
  onContinue?: () => void;
  isTwoPhotos?: boolean;
}) {
  const [hasFirstPhoto, setHasFirstPhoto] = useState(false);
  const [hasSecondPhoto, setHasSecondPhoto] = useState(false);
  const canContinue = hasFirstPhoto && (!isTwoPhotos || hasSecondPhoto);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col text-white">
      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="pb-6">
        <h1 className="text-2xl font-bold  text-center">
          {isTwoPhotos
            ? "Upload two photos to create "
            : "Upload a photo to create "}
          your love story.
        </h1>
      </div>

      <div
        className={`mx-auto py-4 grid w-full ${isTwoPhotos ? "max-w-md grid-cols-2 gap-2" : "max-w-md grid-cols-1"}`}
      >
        <UploadArea
          isTwoPhotos={isTwoPhotos}
          onImageSelected={() => setHasFirstPhoto(true)}
          label={isTwoPhotos ? "UPLOAD YOUR\n1ST PHOTO" : "UPLOAD YOUR PHOTO"}
        />
        {isTwoPhotos && (
          <UploadArea
            isTwoPhotos
            label={"UPLOAD YOUR\n2ND PHOTO"}
            onImageSelected={() => setHasSecondPhoto(true)}
          />
        )}
      </div>

      </div>

      <div className="mt-auto shrink-0">
        <button
          onClick={onContinue}
          type="button"
          disabled={!canContinue}
          className="
                mt-4 min-h-[45px] w-full shrink-0 rounded-full
                px-2 py-2 text-lg font-semibold
                transition-all
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-none
                disabled:bg-white/15
                disabled:text-white/60
                bg-[linear-gradient(92.95deg,_#4A04D1_-22.72%,_#D434E0_28.24%,_#F6AFBB_104.92%)]
              "
        >
          CREATE NOW
        </button>
      </div>
    </div>
  );
}
