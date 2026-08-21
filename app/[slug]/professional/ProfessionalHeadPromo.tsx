'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ProfessionalHeadCurve } from './ProfessionalHeadCurve';

const VIDEO_MP4 = '/head.mp4';
const FALLBACK_IMAGE = '/head.webp';

/** Potong ~10% bagian atas video agar konten promo tidak tertutup kartu putih */
const CROP_TOP_RATIO = 0.1;

function syncPromoAspect(width: number, height: number) {
  if (width <= 0 || height <= 0) return;
  const croppedHeight = Math.round(height * (1 - CROP_TOP_RATIO));
  document.documentElement.style.setProperty('--head-promo-aspect', `${width} / ${croppedHeight}`);
}

export function ProfessionalHeadPromo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  const handleMetadata = useCallback((video: HTMLVideoElement) => {
    syncPromoAspect(video.videoWidth, video.videoHeight);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useFallback) return undefined;

    const onMetadata = () => handleMetadata(video);
    const tryPlay = () => {
      void video.play().catch(() => {
        /* Autoplay blocked until gesture. */
      });
    };

    if (video.readyState >= 1) handleMetadata(video);
    tryPlay();

    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('loadeddata', tryPlay);

    return () => {
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [useFallback, handleMetadata]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--head-promo-aspect');
    };
  }, []);

  return (
    <>
      <div className="professional-head-hero__promo-wrap">
        {useFallback ? (
          <Image
            src={FALLBACK_IMAGE}
            alt="DANA Promo"
            fill
            className="professional-head-hero__promo professional-head-hero__promo--fallback object-cover object-bottom"
            priority
            unoptimized
          />
        ) : (
          <video
            ref={videoRef}
            className="professional-head-hero__promo professional-head-hero__promo-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-label="DANA Promo"
            onLoadedMetadata={(event) => handleMetadata(event.currentTarget)}
            onError={() => setUseFallback(true)}
          >
            <source src={VIDEO_MP4} type="video/mp4" />
          </video>
        )}
      </div>
      <ProfessionalHeadCurve />
    </>
  );
}
