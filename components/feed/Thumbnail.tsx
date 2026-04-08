'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { platformColors, E } from '@/lib/constants';
import PlatformIcon from '@/components/atoms/PlatformIcon';
import LiveDot from '@/components/atoms/LiveDot';

// Shared parallax scroll system — one listener for all Thumbnails
type ParallaxCallback = () => void;
const parallaxCallbacks = new Set<ParallaxCallback>();
let parallaxRafId = 0;
let parallaxListenerActive = false;

function startParallaxListener() {
  if (parallaxListenerActive) return;
  parallaxListenerActive = true;
  const onScroll = () => {
    if (parallaxRafId) return;
    parallaxRafId = requestAnimationFrame(() => {
      parallaxRafId = 0;
      parallaxCallbacks.forEach((cb) => cb());
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

function registerParallax(cb: ParallaxCallback) {
  parallaxCallbacks.add(cb);
  startParallaxListener();
  return () => { parallaxCallbacks.delete(cb); };
}

interface ThumbnailProps {
  platform: string;
  h?: number;
  hover?: boolean;
  isLive?: boolean;
  videoId?: string;
  channelId?: string;
}

export default function Thumbnail({ platform, h = 145, hover = false, isLive = false, videoId, channelId }: ThumbnailProps) {
  const p = useStore((s) => s.p);
  const ac = platformColors[platform];
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const isVisible = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(el);

    const updateParallax = () => {
      if (!isVisible.current || !el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      setParallaxY((center - viewCenter) * 0.03);
    };

    const unregister = registerParallax(updateParallax);
    updateParallax();
    return () => { observer.disconnect(); unregister(); };
  }, [prefersReducedMotion]);

  // Real thumbnail loading
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumbnailUrl = !imgError ? (
    platform === 'youtube' && videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` :
    platform === 'twitch' && channelId ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelId}-640x360.jpg` :
    null
  ) : null;
  const hasVideo = !!(videoId || channelId);

  // Hover preview: animated thumbnail for YouTube
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const previewUrl = platform === 'youtube' && videoId
    ? `https://i.ytimg.com/an_webp/${videoId}/mqdefault_6s.webp`
    : null;
  const previewRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => setPreviewLoaded(true);
    img.onerror = () => setPreviewLoaded(false);
    previewRef.current = img;
  }, [previewUrl]);

  const onImgLoad = useCallback(() => setImgLoaded(true), []);
  const onImgError = useCallback(() => { setImgError(true); setImgLoaded(false); }, []);

  const patterns: Record<string, React.ReactNode> = {
    twitch: (
      <>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, background: `repeating-linear-gradient(135deg, transparent, transparent 12px, ${ac} 12px, ${ac} 13px)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 25% 70%, ${ac}18 0%, transparent 50%)` }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 75% 30%, ${ac}10 0%, transparent 40%)` }} />
      </>
    ),
    youtube: (
      <>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${ac}14 0%, transparent 35%)` }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 40, height: 40, opacity: 0.06 }}>
          <svg viewBox="0 0 24 24" fill={ac}><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 3, borderRadius: 2, background: `${ac}15` }} />
      </>
    ),
    x: (
      <>
        {[20, 35, 50, 65].map((top, i) => (
          <div key={i} style={{ position: 'absolute', top: `${top}%`, left: '12%', right: `${20 + i * 8}%`, height: 2, borderRadius: 1, background: `${p.tx}${i === 0 ? '0A' : '06'}` }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 80% 20%, ${ac}08 0%, transparent 40%)` }} />
      </>
    ),
    substack: (
      <>
        <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', height: 1, background: `${ac}12` }} />
        <div style={{ position: 'absolute', top: '25%', left: '15%', right: '30%', height: 1, background: `${ac}0A` }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${ac}08 0%, transparent 30%, transparent 70%, ${ac}06 100%)` }} />
        <div style={{ position: 'absolute', left: '15%', top: '35%', bottom: '30%', width: 1, background: `${ac}0A` }} />
      </>
    ),
    kick: (
      <>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${p.tx} 1px, transparent 1px), linear-gradient(90deg, ${p.tx} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 40% 60%, ${ac}14 0%, transparent 45%)` }} />
      </>
    ),
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: h,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(${platform === 'youtube' ? '160deg' : '145deg'}, ${ac}${isLive ? '1A' : '0C'} 0%, ${p.bg} ${isLive ? '35%' : '55%'}, ${ac}06 100%)`,
      }}
    >
      {/* Halftone base */}
      <div style={{ position: 'absolute', inset: 0, opacity: (p.ht + (hover ? 0.005 : 0)) * (isLive ? 2 : 1.5), backgroundImage: `radial-gradient(circle, ${p.tx} .45px, transparent .45px)`, backgroundSize: '4.5px 4.5px', backgroundRepeat: 'repeat', mixBlendMode: isLive ? 'overlay' : 'normal', transform: `translateY(${parallaxY}px)`, transition: 'opacity .4s ease' }} />
      {/* Dither dot-grid texture — Nothing-inspired */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, var(--dotgrid-color) var(--dotgrid-dot), transparent var(--dotgrid-dot))`, backgroundSize: 'var(--dotgrid-size) var(--dotgrid-size)', opacity: hover ? 'var(--dotgrid-opacity)' : 'calc(var(--dotgrid-opacity) * 0.5)', mixBlendMode: 'overlay', transition: 'opacity .4s ease', animation: hover ? 'dither-drift 8s linear infinite' : 'none', zIndex: 0 }} />
      {/* ASCII scan-line overlay — dither+motion texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${p.tx}03 2px, ${p.tx}03 3px)`, backgroundSize: '100% 3px', opacity: hover ? 0.12 : 0.04, transition: 'opacity .4s ease', animation: isLive ? 'ascii-scan 2s linear infinite' : 'none', pointerEvents: 'none', zIndex: 0 }} />
      {/* Platform pattern — shifts on hover for depth */}
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${hover ? 2 : 0}px, ${parallaxY * 0.7 + (hover ? -2 : 0)}px)`, transition: `transform .6s ${E}` }}>
        {patterns[platform]}
      </div>
      {/* Watermark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${parallaxY * 1.2}px)` }}>
        <div style={{ transform: `scale(${hover ? (isLive ? 4 : 3) : isLive ? 3.5 : 2.6})`, transition: `transform .6s ${E}`, opacity: 0.06 }}>
          <PlatformIcon platform={platform} size={isLive ? 40 : 32} />
        </div>
      </div>
      {/* Real thumbnail image */}
      {thumbnailUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="" loading="lazy" onLoad={onImgLoad} onError={onImgError} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: imgLoaded ? 1 : 0, transition: `opacity .6s ${E}`, zIndex: 1 }} />
        </>
      )}
      {/* Hover animated preview (YouTube) */}
      {previewLoaded && previewUrl && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: hover && imgLoaded ? 1 : 0, transition: `opacity .35s ${E}`, zIndex: 2 }} />
      )}
      {/* Play button overlay */}
      {hasVideo && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: imgLoaded ? (hover ? 1 : 0.75) : 0, transition: 'opacity .3s ease', zIndex: 4 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
        </div>
      )}
      {/* Shimmer on live — accelerates on hover */}
      {isLive && <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(105deg, transparent 40%, ${ac}08 50%, transparent 60%)`, backgroundSize: '200% 100%', animation: `shimmer ${hover ? '2.5s' : '4s'} ease infinite`, zIndex: imgLoaded ? 2 : 0 }} />}
      {/* Live badge — bracketed ASCII style */}
      {isLive && (
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 4, background: 'rgba(232,64,64,.92)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.1)' }}>
          <LiveDot />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 9, color: '#fff', fontWeight: 600, letterSpacing: '.12em' }}>
            <span style={{ opacity: 0.5 }}>[ </span>LIVE<span style={{ opacity: 0.5 }}> ]</span>
          </span>
        </div>
      )}
      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: isLive ? 80 : 55, background: `linear-gradient(transparent, ${p.card})` }} />
    </div>
  );
}
