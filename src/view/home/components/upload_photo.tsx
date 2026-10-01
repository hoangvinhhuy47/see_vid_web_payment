"use client";

import { useRef, useState } from "react";

export default function UploadPhotoView({
  onContinue,
}: {
  onContinue?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Chỉ cho phép image
    if (!file.type.startsWith("image/")) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white">
      <div className="mx-auto  h-screen w-full max-w-[430px] flex-col px-5">
        {/* Content */}
        <main className="flex min-h-0 flex-1 flex-col">
          {/* Title */}
          <div className="pt-8 pb-6">
            <h1 className="text-3xl font-bold leading-tight">
              Upload the photo
              <br />
              to make your video!
            </h1>
          </div>

          {/* Upload Area */}
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <button
              type="button"
              onClick={handleSelectImage}
              className="
                relative
                flex
                aspect-[3/4]
                w-full
                max-w-[320px]
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border-2
                border-dashed
                border-white/30
                bg-white/5
                transition
                hover:border-white/60
                hover:bg-white/10
                active:scale-[0.98]
              "
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Selected photo"
                    className="h-full w-full object-cover"
                  />

                  {/* Change photo overlay */}
                  <div
                    className="
                      absolute
                      bottom-3
                      left-1/2
                      -translate-x-1/2
                      rounded-full
                      bg-black/70
                      px-4
                      py-2
                      text-sm
                      font-medium
                      backdrop-blur-sm
                    "
                  >
                    Change photo
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-white/5
                    "
                  >
                    <span className="text-4xl font-light">+</span>
                  </div>

                  <span className="text-sm text-white/50">Select a photo</span>
                </div>
              )}
            </button>

            {/* Hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Continue */}
          <div className="shrink-0 pb-6 pt-5">
            <button
              onClick={onContinue}
              type="button"
              disabled={!image}
              className="
                w-full
                rounded-xl
                bg-white
                px-6
                py-4
                text-base
                font-semibold
                text-black
                transition-all
                hover:bg-white/90
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              Create Now
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
