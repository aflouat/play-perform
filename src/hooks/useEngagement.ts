'use client';

import { useEffect, useRef, useState } from 'react';
import type { EngagementPing } from '@/types';

const ACTIVITY_EVENTS = ['mousemove', 'scroll', 'keydown', 'touchstart'] as const;
const AFK_TIMEOUT_MS = 60_000;
const HEARTBEAT_INTERVAL_MS = 30_000;

interface UseEngagementOptions {
  userId: string;
  contentId: string;
  maxDurationSeconds: number;
  onPing?: (ping: EngagementPing) => void;
}

interface UseEngagementReturn {
  isActive: boolean;
  isAfk: boolean;
  elapsedSeconds: number;
  totalSeconds: number;
}

/**
 * Hook de tracking passif.
 * Démarre automatiquement au mount. Pause sur changement d'onglet.
 * Détection AFK après 60s d'inactivité. Heartbeat toutes les 30s.
 * Utilise des refs pour éviter les dépendances cycliques.
 */
export function useEngagement(options: UseEngagementOptions): UseEngagementReturn {
  const { userId, contentId, maxDurationSeconds, onPing } = options;

  const [isActive, setIsActive] = useState(true);
  const [isAfk, setIsAfk] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalRef = useRef(0);
  const isAfkRef = useRef(false);
  const isActiveRef = useRef(true);
  const afkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPingRef = useRef(onPing);
  onPingRef.current = onPing;

  // Tick local chaque seconde
  useEffect(() => {
    tickRef.current = setInterval(() => {
      if (document.hidden || isAfkRef.current) return;
      totalRef.current += 1;
      setElapsedSeconds(totalRef.current);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Heartbeat toutes les 30s
  useEffect(() => {
    heartbeatRef.current = setInterval(() => {
      if (isAfkRef.current || !isActiveRef.current) return;
      if (totalRef.current >= maxDurationSeconds) return;
      const ping: EngagementPing = {
        userId,
        contentId,
        timestamp: new Date(),
        elapsedSeconds: totalRef.current,
      };
      onPingRef.current?.(ping);
    }, HEARTBEAT_INTERVAL_MS);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [userId, contentId, maxDurationSeconds]);

  // Page Visibility API
  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.hidden;
      isActiveRef.current = !hidden;
      setIsActive(!hidden);
      if (!hidden) {
        isAfkRef.current = false;
        setIsAfk(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // AFK detection — effect lancé une seule fois, state géré via refs
  useEffect(() => {
    const resetActivity = () => {
      isAfkRef.current = false;
      setIsAfk(false);
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
      afkTimerRef.current = setTimeout(() => {
        isAfkRef.current = true;
        setIsAfk(true);
      }, AFK_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, resetActivity, { passive: true });
    });

    resetActivity();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, resetActivity);
      });
      if (afkTimerRef.current) clearTimeout(afkTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isActive,
    isAfk,
    elapsedSeconds,
    totalSeconds: totalRef.current,
  };
}
