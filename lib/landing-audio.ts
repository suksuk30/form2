export const LANDING_CHAT_SOUND = '/notif-chat.mp3';

const ALL_SOUNDS = [LANDING_CHAT_SOUND] as const;

/** Prevent spam / overlapping plays of the same sound. */
const PLAY_COOLDOWN_MS = 2500;

let unlocked = false;
let htmlUnlocked = false;
let pendingSound: string | null = null;

const domAudios = new Map<string, HTMLAudioElement>();
const fallbackAudios = new Map<string, HTMLAudioElement>();
const bufferCache = new Map<string, AudioBuffer>();
const decodePromises = new Map<string, Promise<AudioBuffer | null>>();
const lastPlayAt = new Map<string, number>();
const scheduledPlay = new Set<string>();

let audioContext: AudioContext | null = null;
let activeWebSource: AudioBufferSourceNode | null = null;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

function createFallbackAudio(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');
  return audio;
}

/** Register hidden <audio> from LandingAudioHost — must use same nodes for iOS unlock. */
export function registerLandingAudioElement(src: string, element: HTMLAudioElement | null): void {
  if (element) {
    element.preload = 'auto';
    element.setAttribute('playsinline', 'true');
    element.setAttribute('webkit-playsinline', 'true');
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

export function getLandingAudio(src: string): HTMLAudioElement {
  return getAudioElement(src);
}

function markUnlocked(): void {
  unlocked = true;
  // Intentionally do NOT flush pending here.
  // Flushing on unlock caused step-3 notif to play on the wrong screen
  // whenever the user tapped elsewhere after a blocked autoplay attempt.
}

function isInCooldown(src: string): boolean {
  const last = lastPlayAt.get(src);
  if (last == null) return false;
  return Date.now() - last < PLAY_COOLDOWN_MS;
}

function markPlayStarted(src: string): void {
  lastPlayAt.set(src, Date.now());
  scheduledPlay.delete(src);
  if (pendingSound === src) pendingSound = null;
}

function preloadWebAudioBuffer(src: string): void {
  const ctx = audioContext;
  if (!ctx || decodePromises.has(src) || bufferCache.has(src)) return;

  const promise = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error(`Failed to load ${src}`);
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer.slice(0)))
    .then((buffer) => {
      bufferCache.set(src, buffer);
      return buffer;
    })
    .catch(() => null);

  decodePromises.set(src, promise);
}

/** Unlock HTML audio once — avoid repeated .load()/.play() which spams on some Androids. */
function unlockHtmlAudioSync(): void {
  if (htmlUnlocked) return;

  for (const src of ALL_SOUNDS) {
    const audio = getAudioElement(src);
    audio.muted = true;
    audio.volume = 0;

    const playPromise = audio.play();
    if (!playPromise) continue;

    playPromise
      .then(() => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          /* ignore seek errors */
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
}

/** Must run synchronously inside touch/click handler (no await before play/resume). */
export function unlockLandingAudioSync(): boolean {
  if (typeof window === 'undefined') return false;

  const AudioCtx = getAudioContextClass();
  if (!AudioCtx) return false;

  try {
    if (!audioContext) {
      audioContext = new AudioCtx();
    }

    if (audioContext.state === 'suspended') {
      void audioContext.resume().then(() => markUnlocked());
    } else {
      markUnlocked();
    }

    unlockHtmlAudioSync();

    for (const src of ALL_SOUNDS) {
      preloadWebAudioBuffer(src);
    }

    return true;
  } catch {
    return false;
  }
}

export function unlockLandingAudio(): Promise<boolean> {
  return Promise.resolve(unlockLandingAudioSync());
}

function stopActivePlayback(src?: string): void {
  if (activeWebSource) {
    try {
      activeWebSource.stop(0);
    } catch {
      /* already stopped */
    }
    activeWebSource = null;
  }

  const targets = src ? [src] : [...ALL_SOUNDS];
  for (const sound of targets) {
    const audio = domAudios.get(sound) ?? fallbackAudios.get(sound);
    if (!audio) continue;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
}

/** Reuse a single element — cloning caused overlapping spam on some devices. */
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
    pendingSound = src;
    return false;
  }

  markPlayStarted(src);

  playPromise.catch(() => {
    // Autoplay blocked — keep as pending for an explicit later gesture play.
    pendingSound = src;
    lastPlayAt.delete(src);
  });

  return true;
}

function playWebAudioBuffer(src: string, buffer: AudioBuffer): void {
  const ctx = audioContext;
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  stopActivePlayback(src);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  activeWebSource = source;
  source.onended = () => {
    if (activeWebSource === source) activeWebSource = null;
  };
  source.start(0);
  markPlayStarted(src);
}

function tryPlayLandingSound(src: string): boolean {
  if (typeof window === 'undefined') return false;
  if (isInCooldown(src) || scheduledPlay.has(src)) return true;

  const cachedBuffer = bufferCache.get(src);
  if (cachedBuffer && audioContext) {
    playWebAudioBuffer(src, cachedBuffer);
    return true;
  }

  const pendingBuffer = decodePromises.get(src);
  if (pendingBuffer && audioContext) {
    scheduledPlay.add(src);
    void pendingBuffer.then((buffer) => {
      scheduledPlay.delete(src);
      if (isInCooldown(src)) return;
      if (buffer && audioContext) {
        playWebAudioBuffer(src, buffer);
      } else {
        playHtmlAudio(src);
      }
    });
    return true;
  }

  if (unlocked || htmlUnlocked) {
    return playHtmlAudio(src);
  }

  pendingSound = src;
  return false;
}

/**
 * Drop a queued sound so it cannot fire later on another screen.
 * Call when leaving the step/context that requested the sound.
 */
export function clearPendingLandingSound(src?: string): void {
  if (!src || pendingSound === src) {
    pendingSound = null;
  }
  if (src) {
    scheduledPlay.delete(src);
  } else {
    scheduledPlay.clear();
  }
}

/** Play when already unlocked (e.g. after PIN entry). Never auto-plays later on unrelated taps. */
export function playLandingSound(src: string): void {
  if (isInCooldown(src) || scheduledPlay.has(src)) return;
  if (!tryPlayLandingSound(src)) {
    pendingSound = src;
  }
}

/** Play inside a user gesture for best mobile compatibility. */
export function playLandingSoundFromGesture(src: string): void {
  // Clear any other pending sound first so unlock cannot revive a stale queue.
  pendingSound = null;
  unlockLandingAudioSync();

  if (isInCooldown(src) || scheduledPlay.has(src)) return;

  // Prefer immediate HTML play inside the gesture (most reliable on iOS/Android),
  // then optionally skip Web Audio double-fire via cooldown.
  if (bufferCache.get(src) && audioContext && audioContext.state === 'running') {
    playWebAudioBuffer(src, bufferCache.get(src)!);
    return;
  }

  playHtmlAudio(src);
}

export function bindLandingAudioUnlock(): () => void {
  const handler = () => {
    unlockLandingAudioSync();
  };

  document.addEventListener('touchstart', handler, { passive: true, capture: true });
  document.addEventListener('pointerdown', handler, { passive: true, capture: true });
  document.addEventListener('click', handler, { passive: true, capture: true });

  return () => {
    document.removeEventListener('touchstart', handler, { capture: true });
    document.removeEventListener('pointerdown', handler, { capture: true });
    document.removeEventListener('click', handler, { capture: true });
  };
}

export function isLandingAudioUnlocked(): boolean {
  return unlocked;
}
