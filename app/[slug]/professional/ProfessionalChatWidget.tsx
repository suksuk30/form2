'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send, X } from 'lucide-react';
import {
  LANDING_CHAT_SOUND,
  playLandingSound,
  playLandingSoundFromGesture,
  unlockLandingAudioSync,
} from '@/lib/landing-audio';

const CS_GREETING = 'Halo! 👋 Ada yang bisa kami bantu?';
const CS_LOGIN_REPLY = 'Silahkan login terlebih dahulu untuk mengaktifkan fitur.';
const CS_TYPING_DELAY_MS = 1000;

type ChatMessage = {
  id: number;
  from: 'cs' | 'user';
  text: string;
};

function DianaAvatar({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'fab' }) {
  const ring =
    size === 'fab'
      ? 'h-[58px] w-[58px] ring-4 ring-white shadow-[0_4px_20px_rgba(16,142,233,0.45)]'
      : size === 'xs'
        ? 'h-6 w-6 ring-1 ring-white/70'
        : size === 'sm'
          ? 'h-9 w-9 ring-2 ring-white/40'
          : 'h-10 w-10 ring-2 ring-white/30';

  const img =
    size === 'fab' ? 'h-9 w-9' : size === 'xs' ? 'h-4 w-4' : size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-white ${ring}`}>
      <Image src="/diana.svg" alt="DIANA" width={36} height={36} className={`${img} object-contain`} />
    </div>
  );
}

export function ProfessionalChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const nextIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([{ id: nextIdRef.current++, from: 'cs', text: CS_GREETING }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleOpenChat = () => {
    playLandingSoundFromGesture(LANDING_CHAT_SOUND);
    setOpen(true);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    unlockLandingAudioSync();
    setMessages((prev) => [...prev, { id: nextIdRef.current++, from: 'user', text }]);
    setInput('');
    setIsTyping(true);

    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextIdRef.current++, from: 'cs', text: CS_LOGIN_REPLY }]);
      setIsTyping(false);
      playLandingSound(LANDING_CHAT_SOUND);
      typingTimeoutRef.current = null;
    }, CS_TYPING_DELAY_MS);
  };

  if (!open) {
    return (
      <button
        type="button"
        onPointerDown={handleOpenChat}
        className="professional-chat-fab fixed right-4 z-40"
        aria-label="Chat DIANA"
      >
        <DianaAvatar size="fab" />
      </button>
    );
  }

  return (
    <div className="professional-chat-panel-enter fixed inset-x-0 z-50 mx-auto max-w-md px-3">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2.5 bg-[#108EE9] px-3 py-2.5 text-white">
          <DianaAvatar size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold leading-tight">DIANA</p>
            <p className="text-[10px] text-white/80">Digital Assistant</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20"
            aria-label="Tutup chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex max-h-[220px] min-h-[160px] flex-col gap-2 overflow-y-auto bg-[#f4f6f8] px-3 py-3">
          {messages.map((msg) =>
            msg.from === 'user' ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-[#108EE9] px-3 py-2 text-[12px] leading-relaxed text-white">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex items-end gap-1.5">
                <DianaAvatar size="xs" />
                <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[12px] leading-relaxed text-gray-800 shadow-sm">
                  {msg.text}
                  <p className="mt-1 text-[9px] text-gray-400">Baru saja</p>
                </div>
              </div>
            )
          )}

          {isTyping && (
            <div className="flex items-end gap-1.5">
              <DianaAvatar size="xs" />
              <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] text-gray-500">DIANA sedang mengetik…</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            disabled={isTyping}
            className="min-w-0 flex-1 rounded-full bg-gray-100 px-3 py-2 text-[12px] outline-none placeholder:text-gray-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#108EE9] text-white disabled:opacity-40"
            aria-label="Kirim"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
