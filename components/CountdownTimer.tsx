'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: Date;
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getColorClass = () => {
    const totalMinutes = timeRemaining / (1000 * 60);
    
    if (totalMinutes > 5) {
      return 'text-green-600';
    } else if (totalMinutes > 2) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  if (timeRemaining <= 0) {
    return (
      <span className="text-red-600 font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Expired
      </span>
    );
  }

  return (
    <span className={`font-medium flex items-center gap-1 ${getColorClass()}`}>
      <Clock className="w-3 h-3" />
      {formatTime(timeRemaining)}
    </span>
  );
} 