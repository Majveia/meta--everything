'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { E } from '@/lib/constants';
import { platformColors } from '@/lib/constants';
import Avatar from '@/components/atoms/Avatar';
import LiveDot from '@/components/atoms/LiveDot';

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  isUser?: boolean;
}

interface LiveChatSectionProps {
  platform: string;
  channelId?: string;
  videoId?: string;
  isLive?: boolean;
  itemId: string;
}

function formatNow(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function LiveChatSection({ platform, channelId, videoId, isLive, itemId }: LiveChatSectionProps) {
  const p = useStore((s) => s.p);
  const ac = platformColors[platform] || '#888';

  // For Twitch: embed Twitch chat
  if (isLive && platform === 'twitch' && channelId) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return (
      <div style={{ marginTop: 28 }}>
        <ChatHeader platform={platform} isLive />
        <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.bdr}`, height: 400 }}>
          <iframe
            src={`https://www.twitch.tv/embed/${channelId}/chat?parent=${host}&darkpopout`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Twitch Chat"
          />
        </div>
      </div>
    );
  }

  // For Kick: embed Kick chat
  if (isLive && platform === 'kick' && channelId) {
    return (
      <div style={{ marginTop: 28 }}>
        <ChatHeader platform={platform} isLive />
        <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.bdr}`, height: 400 }}>
          <iframe
            src={`https://kick.com/${channelId}/chatroom`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Kick Chat"
          />
        </div>
      </div>
    );
  }

  // For YouTube live: embed YouTube live chat
  if (isLive && platform === 'youtube' && videoId) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return (
      <div style={{ marginTop: 28 }}>
        <ChatHeader platform={platform} isLive />
        <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${p.bdr}`, height: 400 }}>
          <iframe
            src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${host}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="YouTube Live Chat"
          />
        </div>
      </div>
    );
  }

  // Fallback: local discussion chat
  return <LocalChat itemId={itemId} platform={platform} />;
}

function ChatHeader({ platform, isLive }: { platform: string; isLive?: boolean }) {
  const p = useStore((s) => s.p);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: p.txM }}>
        <span style={{ opacity: 0.35 }}>[ </span>Chat<span style={{ opacity: 0.35 }}> ]</span>
      </span>
      {isLive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <LiveDot />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#E84040' }}>
            Live
          </span>
        </div>
      )}
      <div style={{ flex: 1, height: 1, backgroundImage: `radial-gradient(circle, ${p.txF} 0.5px, transparent 0.5px)`, backgroundSize: '6px 6px', backgroundRepeat: 'repeat-x', opacity: 0.3 }} />
    </div>
  );
}

function LocalChat({ itemId, platform }: { itemId: string; platform: string }) {
  const p = useStore((s) => s.p);
  const ac = platformColors[platform] || '#888';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        author: 'You',
        text,
        time: formatNow(),
        isUser: true,
      },
    ]);
    setInput('');
  }, [input]);

  return (
    <div style={{ marginTop: 28 }}>
      <ChatHeader platform={platform} />

      {/* Chat messages area */}
      <div
        ref={scrollRef}
        style={{
          height: 280,
          overflowY: 'auto',
          border: `1px solid ${p.bdr}`,
          borderRadius: 10,
          padding: 14,
          background: p.bgS,
          marginBottom: 10,
          scrollbarWidth: 'thin',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={p.txF} strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: p.txF, letterSpacing: '.04em' }}>
              Start the conversation
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  flexDirection: msg.isUser ? 'row-reverse' : 'row',
                }}
              >
                <Avatar name={msg.author} color={msg.isUser ? ac : p.txM} size={24} />
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: msg.isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    background: msg.isUser ? `${ac}18` : p.bgH,
                    border: `1px solid ${msg.isUser ? `${ac}30` : p.bdr}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 11, fontWeight: 500, color: msg.isUser ? ac : p.tx }}>
                      {msg.author}
                    </span>
                    <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 8, color: p.txF }}>
                      {msg.time}
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-body), 'Outfit', sans-serif", fontSize: 13, color: p.txS, lineHeight: 1.5, margin: 0 }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: `1px solid ${p.bdr}`,
            background: p.bgS,
            color: p.tx,
            fontFamily: "var(--font-body), 'Outfit', sans-serif",
            fontSize: 13,
            outline: 'none',
            transition: `border-color .2s ${E}`,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = ac; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = p.bdr; }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            background: input.trim() ? ac : p.bgH,
            color: input.trim() ? '#fff' : p.txF,
            fontFamily: "'SF Mono', monospace",
            fontSize: 10,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: `all .2s ${E}`,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
