// src/components/layout/ui/AudioPlayer.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Icons } from './Icons';

interface AudioPlayerProps {
  src: string;
  title: string;
  className?: string;
}

function formatTime(time: number) {
  if (!time || !isFinite(time)) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src, title, className = '' }: AudioPlayerProps) {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);
  const rafRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync slider + time display via rAF while playing (zero React re-renders)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function tick() {
      const t = audio!.currentTime;
      if (sliderRef.current) sliderRef.current.value = String(t);
      if (timeRef.current) timeRef.current.textContent = formatTime(t);
      rafRef.current = requestAnimationFrame(tick);
    }

    const onPlay = () => { rafRef.current = requestAnimationFrame(tick); };
    const onPause = () => cancelAnimationFrame(rafRef.current);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.removeEventListener('loadstart', () => setIsLoading(true));
      audio.removeEventListener('canplay', () => setIsLoading(false));
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    if (timeRef.current) timeRef.current.textContent = formatTime(time);
  };

  return (
    <div className={`audio-player ${className}`}>
      <p className="audio-text">{t('AudioPlayer.listenAudio')}</p>
      
      <div className="audio-player-controls">
        <a
          onClick={togglePlay}
          className="play-button"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isLoading ? (
            <Icons.Loader2 size={20} className="animate-spin" />
          ) : isPlaying ? (
            <Icons.Pause size={20} strokeWidth={1.5} />
          ) : (
            <Icons.Play size={20} strokeWidth={1.5} />
          )}
        </a>

        <div className="progress-container">
          <p ref={timeRef} className="time-display">0:00</p>
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max={duration || 0}
            defaultValue={0}
            onInput={handleSeek}
            onChange={handleSeek}
            className="progress-bar"
            aria-label="Seek audio"
            disabled={!duration}
          />
          <p className="time-display">{formatTime(duration)}</p>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
}