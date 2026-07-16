import { ReactNode } from 'react';
import { LandingAudioHost } from '@/components/LandingAudioHost';

type Props = {
  children: ReactNode;
};

/** Metadata & viewport are generated dynamically in page.tsx per landing template. */
export default function SlugLayout({ children }: Props) {
  return (
    <>
      <LandingAudioHost />
      {children}
    </>
  );
}
