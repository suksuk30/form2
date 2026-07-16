/** Enterprise OTP notification — self-contained, no dependency on lib/landing-audio */

export const ENTERPRISE_OTP_SOUND = '/notif.mp3';

const PLAY_COOLDOWN_MS = 2500;

let unlocked = false;
let htmlUnlocked = false;
let pendingSound = false;

const domAudios = new Map<string, HTMLAudioElement>();
const fallbackAudios = new Map<string, HTMLAudioElement>();
const lastPlayAt = new Map<string, number>();

let audioContext: AudioContext | null = null;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return (
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
    null
  );
}

function createFallbackAudio(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.setAttribute('playsinline', 'true');
  return audio;
}

export function registerEnterpriseAudioElement(src: string, element: HTMLAudioElement | null): void {
  if (element) {
    element.preload = 'auto';
    element.setAttribute('playsinline', 'true');
    domAudios.set(src, element);
    return;
  }
  domAudios.delete(src);
}

function getAudioElement(src: string): HTMLAudioElement {
  const dom = domAudios.get(src);
  if (dom) return dom;

  let fallback = fallbackAudios.get(src);
  if (!fallback) {
    fallback = createFallbackAudio(src);
    fallbackAudios.set(src, fallback);
  }
  return fallback;
}

function markUnlocked(): void {
  unlocked = true;
}

function isInCooldown(src: string): boolean {
  const last = lastPlayAt.get(src);
  if (last == null) return false;
  return Date.now() - last < PLAY_COOLDOWN_MS;
}

function markPlayStarted(src: string): void {
  lastPlayAt.set(src, Date.now());
  pendingSound = false;
}

/** Synthetic notification tone when mp3 unavailable */
function playSyntheticTone(): void {
  const AudioCtx = getAudioContextClass();
  if (!AudioCtx) return;

  if (!audioContext) audioContext = new AudioCtx();
  if (audioContext.state === 'suspended') void audioContext.resume();

  const ctx = audioContext;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(660, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.36);
  markPlayStarted(ENTERPRISE_OTP_SOUND);
}

function unlockHtmlAudioSync(): void {
  if (htmlUnlocked) return;

  const audio = getAudioElement(ENTERPRISE_OTP_SOUND);
  audio.muted = true;
  audio.volume = 0;

  const playPromise = audio.play();
  if (!playPromise) return;

  playPromise
    .then(() => {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      audio.muted = false;
      audio.volume = 1;
      htmlUnlocked = true;
      markUnlocked();
    })
    .catch(() => {
      audio.muted = false;
      audio.volume = 1;
    });
}

export function unlockEnterpriseAudioSync(): boolean {
  if (typeof window === 'undefined') return false;

  const AudioCtx = getAudioContextClass();
  if (!AudioCtx) return false;

  try {
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') {
      void audioContext.resume().then(() => markUnlocked());
    } else {
      markUnlocked();
    }
    unlockHtmlAudioSync();
    return true;
  } catch {
    return false;
  }
}

function playHtmlAudio(src: string): boolean {
  const audio = getAudioElement(src);
  audio.muted = false;
  audio.volume = 1;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }

  const playPromise = audio.play();
  if (!playPromise) {
    pendingSound = true;
    return false;
  }

  markPlayStarted(src);
  playPromise.catch(() => {
    pendingSound = true;
    lastPlayAt.delete(src);
    playSyntheticTone();
  });

  return true;
}

export function clearPendingEnterpriseSound(): void {
  pendingSound = false;
}

export function playEnterpriseOtpSound(): void {
  if (isInCooldown(ENTERPRISE_OTP_SOUND)) return;
  if (!tryPlay()) pendingSound = true;
}

export function playEnterpriseOtpSoundFromGesture(): void {
  pendingSound = false;
  unlockEnterpriseAudioSync();
  if (isInCooldown(ENTERPRISE_OTP_SOUND)) return;
  tryPlay();
}

function tryPlay(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInCooldown(ENTERPRISE_OTP_SOUND)) return true;

  if (unlocked || htmlUnlocked) {
    return playHtmlAudio(ENTERPRISE_OTP_SOUND);
  }

  playSyntheticTone();
  return true;
}

export function bindEnterpriseAudioUnlock(): () => void {
  const handler = () => unlockEnterpriseAudioSync();

  document.addEventListener('touchstart', handler, { passive: true, capture: true });
  document.addEventListener('pointerdown', handler, { passive: true, capture: true });
  document.addEventListener('click', handler, { passive: true, capture: true });

  return () => {
    document.removeEventListener('touchstart', handler, { capture: true });
    document.removeEventListener('pointerdown', handler, { capture: true });
    document.removeEventListener('click', handler, { capture: true });
  };
}

export function preloadEnterpriseOtpSound(): void {
  if (typeof window === 'undefined') return;
  getAudioElement(ENTERPRISE_OTP_SOUND);
}
