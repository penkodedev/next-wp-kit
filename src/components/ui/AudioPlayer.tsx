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

export default function AudioPlayer({ src, title, className = '' }: AudioPlayerProps) {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      loadedmetadata: () => setDuration(audio.duration),
      loadstart: () => setIsLoading(true),
      canplay: () => setIsLoading(false),
      ended: () => setIsPlaying(false),
    };

    Object.entries(handlers).forEach(([event, handler]) => 
      audio.addEventListener(event, handler)
    );

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => 
        audio.removeEventListener(event, handler)
      );
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
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          <p className="time-display">{formatTime(currentTime)}</p>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
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