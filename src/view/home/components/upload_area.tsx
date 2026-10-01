"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useId, useState } from "react";

export default function UploadArea({
  label = "UPLOAD YOUR PHOTO",
  isTwoPhotos = false,
  onImageSelected,
}: {
  label?: string;
  isTwoPhotos?: boolean;
  onImageSelected?: () => void;
}) {
  const inputId = useId();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setImage(URL.createObjectURL(file));
    onImageSelected?.();
    event.target.value = "";
  };

  return (
    <label
      htmlFor={inputId}
      className={`relative flex w-full cursor-pointer items-center justify-center overflow-hidden border-dashed bg-[#161616] ${
        isTwoPhotos
          ? "aspect-[2/3] rounded-lg border border-white/40"
          : "aspect-square rounded-[22px] border-2 border-white/70"
      }`}
    >
      <div className={`pointer-events-none absolute -top-20 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-[70px] ${isTwoPhotos ? "bg-violet-600/10" : "bg-violet-600/30"}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20" />

      {image ? (
        <>
          <img src={image} alt={label} className="absolute inset-0 z-10 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/20 px-2 backdrop-blur-[1px]">
            <span className={`text-center font-bold text-white text-sm shadow-md}`}>
              CHANGE <br/> PHOTO
            </span>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex flex-col items-center px-2">
          <div className={`flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md ${isTwoPhotos ? "h-16 w-16" : "h-20 w-20"} "`}>
            <ImagePlus className={"h-8 w-8 text-white "} strokeWidth={2.3} />
          </div>
          <p className={`text-center font-bold text-white ${isTwoPhotos ? "mt-3 whitespace-pre-line text-md leading-tight" : "mt-5 text-sm sm:text-xl"}`}>{label}</p>
        </div>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        aria-label={image ? "CHANGE PHOTO" : label}
        onChange={handleImageChange}
        className="hidden"
      />
    </label>
  );
}
